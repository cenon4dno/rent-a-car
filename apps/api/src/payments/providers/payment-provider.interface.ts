export interface PaymentIntent {
  providerRef: string;
  checkoutUrl: string | null;
  directConfirm: boolean;
}

export interface IPaymentProvider {
  createIntent(params: {
    bookingId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    successUrl: string;
    failedUrl: string;
  }): Promise<PaymentIntent>;

  verifyWebhookSignature(rawBody: string, signature: string): boolean;

  extractBookingIdFromWebhook(payload: Record<string, unknown>): string | null;

  isSuccessEvent(payload: Record<string, unknown>): boolean;
}
