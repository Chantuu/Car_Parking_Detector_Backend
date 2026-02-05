import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { ParkingService } from './parking.service';
import { parkingSpotsNotRegisteredErrorMessage } from 'src/helper/messages/messages.variables';
import { SensorDataDTO } from './Dtos/sensor-data.dto';
import { successResponse } from 'src/helper/functions/success-response.function';

/**
 * This controller is responsible for routing and managing all endpoints related to the parking.
 * Whole controller is protected AuthGuard.
 */
@Controller('api/parking')
export class ParkingController {
  constructor(private _parkingService: ParkingService) {}

  /**
   * This endpoint returns all current parking spot data as a list.
   * If no parking spot data is avaliable in the database, it throws
   * Nest exception to properly give error response.
   *
   * @returns Promise with response object containing all parking spot data.
   */
  @Get('parkingSpots')
  async getAllParkingSpots() {
    const parkingSpotArray = await this._parkingService.getAllParkingSpots();

    if (parkingSpotArray.length > 0) {
      return successResponse('success', parkingSpotArray);
    } else {
      throw new NotFoundException(parkingSpotsNotRegisteredErrorMessage);
    }
  }

  /**
   * This endpoint gets current data of all parking spots from the sensor and
   * returns updated parking spots data to the sensor.
   *
   * @param sensorDataDTO - Request body containing all parking spots data from sensor.
   * @returns Updated parking spots data for the sensor.
   */
  @Post('sensor')
  async saveSpotDataFromSensor(@Body() sensorDataDTO: SensorDataDTO) {
    const resultSpotData =
      await this._parkingService.saveSpotDataFromSensor(sensorDataDTO);
    return successResponse('success', resultSpotData);
  }
}
