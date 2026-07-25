import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { DisputesModule } from './disputes/disputes.module';
import { ChatModule } from './chat/chat.module';
import { DriversModule } from './drivers/drivers.module';
import { NotificationsModule } from './notifications/notifications.module';
import { KycModule } from './kyc/kyc.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    UsersModule,
    AuthModule,
    VehiclesModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    AdminModule,
    DisputesModule,
    ChatModule,
    DriversModule,
    KycModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
