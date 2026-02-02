import { IsUUID } from 'class-validator';

/**
 * This class is used to validate request body data for creating
 * new reservation.
 */
export class CreateReservationDTO {
  /**
   * This column contains id of the parking spot the reservation is created for,
   * which must be UUID.
   */
  @IsUUID()
  parkingSpotId: string;
}
