import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { ConfigModule } from '@nestjs/config';
import { PaymentsModule } from './payments/payments.module';
import { PaymentCard } from './payments/payment-card.entity';
import { EncryptionModule } from './encryption/encryption.module';
import { ParkingModule } from './parking/parking.module';
import { ParkingSpot } from './parking/parking-spot.entity';
import { ReservationModule } from './reserves/reservation.module';
import { Reservation } from './reserves/reservation.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'main.db',
      entities: [User, PaymentCard, ParkingSpot, Reservation],
      synchronize: true,
    }),
    AuthModule,
    PaymentsModule,
    EncryptionModule,
    ParkingModule,
    ReservationModule,
  ],
})
export class AppModule {}
