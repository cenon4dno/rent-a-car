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

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    VehiclesModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    AdminModule,
    DisputesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
