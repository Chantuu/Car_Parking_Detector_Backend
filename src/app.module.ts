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
import { ReservesModule } from './reserves/reservation.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'main.db',
      entities: [User, PaymentCard, ParkingSpot],
      synchronize: true,
    }),
    AuthModule,
    PaymentsModule,
    EncryptionModule,
    ParkingModule,
    ReservesModule,
  ],
})
export class AppModule {}
