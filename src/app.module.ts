import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { ConfigModule } from '@nestjs/config';
import { PaymentsModule } from './payments/payments.module';
import { PaymentCard } from './payments/payment-card.entity';
import { EncryptionModule } from './encryption/encryption.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'main.db',
      entities: [User, PaymentCard],
      synchronize: true,
    }),
    AuthModule,
    PaymentsModule,
    EncryptionModule,
  ],
})
export class AppModule {}
