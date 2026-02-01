import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/helper/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { ReservationService } from './reservation.service';
import { CreateReservationDTO } from './DTOs/create-reservation.dto';

@Controller('api/reservation')
@UseGuards(AuthGuard)
export class ReservationController {
  constructor(private _reservationService: ReservationService) {}

  @Post()
  async createReservation(
    @CurrentUser() user: User,
    @Body() createReservationDTO: CreateReservationDTO,
  ) {
    return await this._reservationService.createReservation(
      user,
      createReservationDTO,
    );
  }
}
