import { IsEnum, IsString } from 'class-validator';
import { ParkingSpotStatus } from 'src/helper/enums/parking-spot-status.enum';

/**
 * This DTO class validates parking spot data related request body.
 */
export class ParkingSpotDto {
  /**
   * This property must contain parking spot name as string.
   */
  @IsString()
  spotName: string;

  /**
   * This property must contain parking spot status as ParkingSpotStatus enum.
   */
  @IsEnum(ParkingSpotStatus)
  status: ParkingSpotStatus;

  /**
   * This property must contain parking spot sensor id as string.
   */
  @IsString()
  sensorId: string;
}
