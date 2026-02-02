import { IsIn } from 'class-validator';
import { ReservationStatus } from 'src/helper/enums/reservation-status.enum';

/**
 * This class is used to validate request body data for creating
 * new reservation.
 */
export class EditReservationDTO {
  /**
   * This property contains new status of th reservation, which must be
   * CANCELLED or COMPLETED values of Reservation status enum.
   */
  @IsIn([ReservationStatus.CANCELLED, ReservationStatus.COMPLETED])
  status: ReservationStatus;
}
