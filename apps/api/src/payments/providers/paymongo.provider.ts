import { createHmac } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { IPaymentProvider, PaymentIntent, CardDetails } from './payment-provider.interface';

const SOURCE_TYPES: Record<string, string> = {
  gcash: 'gcash',
  maya: 'paymaya',
};

@Injectable()
export class PaymongoPaymentProvider implements IPaymentProvider {
  private readonly logger = new Logger(PaymongoPaymentProvider.name);
  private readonly secretKey = process.env.PAYMONGO_SECRET_KEY ?? '';
  private readonly webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET ?? '';
  private readonly baseUrl = 'https://api.paymongo.com/v1';

  private get authHeader() {
    return `Basic ${Buffer.from(`${this.secretKey}:`).toString('base64')}`;
  }

  async createIntent(params: {
    bookingId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    successUrl: string;
    failedUrl: string;
    cardDetails?: CardDetails;
  }): Promise<PaymentIntent> {
    if (params.paymentMethod === 'card' && params.cardDetails) {
      return this.createCardIntent(
        params.bookingId,
        params.amount,
        params.cardDetails,
        params.successUrl,
      );
    }
    return this.createSourceIntent(params);
  }

  private async createSourceIntent(params: {
    bookingId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    successUrl: string;
    failedUrl: string;
  }): Promise<PaymentIntent> {
    const sourceType = SOURCE_TYPES[params.paymentMethod] ?? 'gcash';
    const amountCentavos = Math.round(params.amount * 100);

    const res = await fetch(`${this.baseUrl}/sources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authHeader,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountCentavos,
            currency: params.currency,
            type: sourceType,
            redirect: {
              success: params.successUrl,
              failed: params.failedUrl,
            },
            metadata: { bookingId: params.bookingId },
          },
        },
      }),
    });

    if (!res.ok) {
      const err = (await res.json()) as { errors?: { detail: string }[] };
      const msg = err.errors?.[0]?.detail ?? 'PayMongo error';
      this.logger.error(`PayMongo source creation failed: ${msg}`);
      throw new Error(msg);
    }

    const data = (await res.json()) as {
      data: { id: string; attributes: { redirect: { checkout_url: string } } };
    };

    return {
      providerRef: data.data.id,
      checkoutUrl: data.data.attributes.redirect.checkout_url,
      directConfirm: false,
    };
  }

  private async createCardIntent(
    bookingId: string,
    amount: number,
    card: CardDetails,
    returnUrl: string,
  ): Promise<PaymentIntent> {
    const amountCentavos = Math.round(amount * 100);

    // Step 1: Create PaymentIntent
    const intentRes = await fetch(`${this.baseUrl}/payment_intents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: this.authHeader },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountCentavos,
            payment_method_allowed: ['card'],
            currency: 'PHP',
            capture_type: 'automatic',
            metadata: { bookingId },
          },
        },
      }),
    });

    if (!intentRes.ok) {
      const err = (await intentRes.json()) as { errors?: { detail: string }[] };
      throw new Error(err.errors?.[0]?.detail ?? 'Failed to create payment intent');
    }

    const intentData = (await intentRes.json()) as { data: { id: string } };
    const intentId = intentData.data.id;

    // Step 2: Create PaymentMethod
    const [expMonth, expYear] = [card.expMonth, card.expYear];
    const pmRes = await fetch(`${this.baseUrl}/payment_methods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: this.authHeader },
      body: JSON.stringify({
        data: {
          attributes: {
            type: 'card',
            details: {
              card_number: card.cardNumber.replace(/\s/g, ''),
              exp_month: expMonth,
              exp_year: expYear,
              cvc: card.cvc,
            },
            billing: { name: card.cardHolder },
          },
        },
      }),
    });

    if (!pmRes.ok) {
      const err = (await pmRes.json()) as { errors?: { detail: string }[] };
      throw new Error(err.errors?.[0]?.detail ?? 'Failed to tokenize card');
    }

    const pmData = (await pmRes.json()) as { data: { id: string } };

    // Step 3: Attach PaymentMethod to Intent
    const attachRes = await fetch(`${this.baseUrl}/payment_intents/${intentId}/attach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: this.authHeader },
      body: JSON.stringify({
        data: {
          attributes: {
            payment_method: pmData.data.id,
            return_url: returnUrl,
          },
        },
      }),
    });

    if (!attachRes.ok) {
      const err = (await attachRes.json()) as { errors?: { detail: string }[] };
      throw new Error(err.errors?.[0]?.detail ?? 'Failed to attach payment method');
    }

    const attachData = (await attachRes.json()) as {
      data: {
        id: string;
        attributes: {
          status: string;
          next_action?: { type: string; redirect?: { url: string } };
        };
      };
    };

    const attrs = attachData.data.attributes;

    if (attrs.status === 'succeeded') {
      return { providerRef: intentId, checkoutUrl: null, directConfirm: true };
    }

    if (attrs.next_action?.type === 'redirect' && attrs.next_action.redirect?.url) {
      return {
        providerRef: intentId,
        checkoutUrl: attrs.next_action.redirect.url,
        directConfirm: false,
      };
    }

    throw new Error(`Unexpected payment intent status: ${attrs.status}`);
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const expected = createHmac('sha256', this.webhookSecret).update(rawBody).digest('hex');
    return expected === signature;
  }

  extractBookingIdFromWebhook(payload: Record<string, unknown>): string | null {
    try {
      const attrs = (payload['data'] as { attributes?: { metadata?: { bookingId?: string } } })
        ?.attributes;
      return attrs?.metadata?.bookingId ?? null;
    } catch {
      return null;
    }
  }

  isSuccessEvent(payload: Record<string, unknown>): boolean {
    const type = payload['type'] as string | undefined;
    return (
      type === 'source.chargeable' || type === 'payment.paid' || type === 'payment_intent.succeeded'
    );
  }
}
