import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/helper/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { ReservationService } from './reservation.service';
import { CreateReservationDTO } from './DTOs/create-reservation.dto';
import { EditReservationDTO } from './DTOs/edit-reservation.dto';

@Controller('api/reservation')
@UseGuards(AuthGuard)
export class ReservationController {
  constructor(private _reservationService: ReservationService) {}
  @Get()
  async getCurrentActiveReservation(@CurrentUser() user: User) {
    return await this._reservationService.getCurrentActiveReservation(user);
  }

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

  @Patch()
  async editActiveReservation(
    @CurrentUser() user: User,
    @Body() editReservationDTO: EditReservationDTO,
  ) {
    return await this._reservationService.editActiveReservation(
      user,
      editReservationDTO,
    );
  }
}
