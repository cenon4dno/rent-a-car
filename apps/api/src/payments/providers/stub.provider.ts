import { Injectable } from '@nestjs/common';
import { IPaymentProvider, PaymentIntent } from './payment-provider.interface';

@Injectable()
export class StubPaymentProvider implements IPaymentProvider {
  async createIntent(_params: { bookingId: string }): Promise<PaymentIntent> {
    return {
      providerRef: `STUB-${Date.now()}`,
      checkoutUrl: null,
      directConfirm: true,
    };
  }

  verifyWebhookSignature(_rawBody: string, _signature: string): boolean {
    return true;
  }

  extractBookingIdFromWebhook(payload: Record<string, unknown>): string | null {
    return (payload['bookingId'] as string) ?? null;
  }

  isSuccessEvent(_payload: Record<string, unknown>): boolean {
    return true;
  }
}
