import { Module } from '@nestjs/common';
import { ReservesController } from './reservation.controller';
import { ReservesService } from './reservation.service';

@Module({
  controllers: [ReservesController],
  providers: [ReservesService],
})
export class ReservesModule {}
