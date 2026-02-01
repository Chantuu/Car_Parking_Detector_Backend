import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { ParkingService } from './parking.service';
import { parkingSpotsNotRegisteredErrorMessage } from 'src/helper/messages/messages.variables';

@Controller('api/parking')
@UseGuards(AuthGuard)
export class ParkingController {
  constructor(private _parkingService: ParkingService) {}

  @Get('parkingSpots')
  async getAllParkingSpots() {
    const parkingSpotArray = await this._parkingService.getAllParkingSpots();

    if (parkingSpotArray.length > 0) {
      return {
        status: 'success',
        data: parkingSpotArray,
      };
    } else {
      throw new NotFoundException(parkingSpotsNotRegisteredErrorMessage);
    }
  }
}
