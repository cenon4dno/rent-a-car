export interface PaymentIntent {
  providerRef: string;
  checkoutUrl: string | null;
  directConfirm: boolean;
}

export interface CardDetails {
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvc: string;
  cardHolder: string;
}

export interface IPaymentProvider {
  createIntent(params: {
    bookingId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    successUrl: string;
    failedUrl: string;
    cardDetails?: CardDetails;
  }): Promise<PaymentIntent>;

  verifyWebhookSignature(rawBody: string, signature: string): boolean;

  extractBookingIdFromWebhook(payload: Record<string, unknown>): string | null;

  isSuccessEvent(payload: Record<string, unknown>): boolean;
}
