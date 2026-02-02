import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/helper/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { ReservationService } from './reservation.service';
import { CreateReservationDTO } from './DTOs/create-reservation.dto';
import { EditReservationDTO } from './DTOs/edit-reservation.dto';
import { successResponse } from 'src/helper/functions/success-response.function';

/**
 * This controller is used to manage routing for the reservation endpoints.
 * Whole controller is protected AuthGuard.
 */
@Controller('api/reservation')
@UseGuards(AuthGuard)
export class ReservationController {
  constructor(private _reservationService: ReservationService) {}

  /**
   * This endpoint returns currently active reservation of the current user.
   *
   * @param currentUser - User currently signed in.
   * @returns Promise containing active reservation data of the current user
   */
  @Get()
  async getCurrentActiveReservation(@CurrentUser() currentUser: User) {
    const currentActiveReservation =
      await this._reservationService.getCurrentActiveReservation(currentUser);
    return successResponse('success', currentActiveReservation);
  }

  /**
   * This method returns all reservation entity list of the current user.
   *
   * @param currentUser - User currently signed in.
   * @returns Promise containing list of formatted reservation data
   */
  @Get('all')
  async getAllReservation(@CurrentUser() currentUser: User) {
    const userReservations =
      await this._reservationService.getAllReservation(currentUser);
    return successResponse('success', userReservations);
  }

  /**
   * This endpoint creates new active reservation for the current user only
   * when it does not have any active reservation.
   *
   * @param currentUser - User currently signed in.
   * @param createReservationDTO - Request body containing reservation data for creation.
   * @returns Promise containing newly created reservation data
   */
  @Post()
  async createReservation(
    @CurrentUser() currentUser: User,
    @Body() createReservationDTO: CreateReservationDTO,
  ) {
    const newReservation = await this._reservationService.createReservation(
      currentUser,
      createReservationDTO,
    );
    return successResponse('success', newReservation);
  }

  /**
   * This endpoint is used to change status of the active reservation for current
   * user, when it cancelled or checked in reservation.
   *
   * @param currentUser - User currently signed in.
   * @param editReservationDTO - Request body containing reservation data for updating.
   * @returns Promise containing recently updated reservation data
   */
  @Patch()
  async editActiveReservation(
    @CurrentUser() currentUser: User,
    @Body() editReservationDTO: EditReservationDTO,
  ) {
    const editedReservation =
      await this._reservationService.editActiveReservation(
        currentUser,
        editReservationDTO,
      );
    return successResponse('success', editedReservation);
  }
}
