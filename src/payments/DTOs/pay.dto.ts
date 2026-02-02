import { IsIn, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { ReservationStatus } from 'src/helper/enums/reservation-status.enum';

/**
 * This class is used to validate request body for the pay endpoint.
 */
export class PayDTO {
  /**
   * This is optional property used to specify amount to detuct form user's balance.
   */
  @IsNumber()
  @IsOptional()
  @Min(0.01)
  amount?: number;

  /**
   * This property saves current reservation status to properly detuct money.
   */
  @IsIn([ReservationStatus.CANCELLED, ReservationStatus.COMPLETED])
  reservationStatus: ReservationStatus;
}
