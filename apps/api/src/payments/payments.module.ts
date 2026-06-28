import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService, PAYMENT_PROVIDER } from './payments.service';
import { StubPaymentProvider } from './providers/stub.provider';
import { PaymongoPaymentProvider } from './providers/paymongo.provider';

const paymentProviderFactory = {
  provide: PAYMENT_PROVIDER,
  useFactory: () => {
    if (process.env.PAYMONGO_SECRET_KEY) {
      return new PaymongoPaymentProvider();
    }
    return new StubPaymentProvider();
  },
};

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, paymentProviderFactory],
})
export class PaymentsModule {}
