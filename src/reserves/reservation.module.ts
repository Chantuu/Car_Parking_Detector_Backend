import { Module } from '@nestjs/common';
import { ReservesController } from './reservation.controller';
import { ReservesService } from './reservation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './reservation.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation]), AuthModule],
  controllers: [ReservesController],
  providers: [ReservesService],
})
export class ReservesModule {}
