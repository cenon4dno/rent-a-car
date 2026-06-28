import { createHmac } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { IPaymentProvider, PaymentIntent } from './payment-provider.interface';

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
  }): Promise<PaymentIntent> {
    const sourceType = SOURCE_TYPES[params.paymentMethod] ?? 'gcash';
    // PayMongo amounts are in centavos (PHP cents)
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
    return type === 'source.chargeable' || type === 'payment.paid';
  }
}
