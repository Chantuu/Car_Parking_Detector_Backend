import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './reservation.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ParkingModule } from 'src/parking/parking.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation]), AuthModule, ParkingModule],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
