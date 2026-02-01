import { SensorDataDTO } from './Dtos/sensor-data.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParkingSpot } from './parking-spot.entity';
import { Repository } from 'typeorm';
import { ParkingSpotStatus } from 'src/helper/enums/parking-spot-status.enum';

@Injectable()
export class ParkingService {
  constructor(
    @InjectRepository(ParkingSpot)
    private _parkingSpotRepository: Repository<ParkingSpot>,
  ) {}

  getAllParkingSpots() {
    return this._parkingSpotRepository.find({});
  }

  async saveSpotDataFromSensor(sensorDataDTO: SensorDataDTO) {
    const existingSpots = await this.getAllParkingSpots();

    const existingSpotsMap = new Map(
      existingSpots.map((spot) => [spot.sensorId, spot]),
    );

    const spotsToPersist = sensorDataDTO.parkingSpots.map((incomingSpotDTO) => {
      const persistedSpot = existingSpotsMap.get(incomingSpotDTO.sensorId);

      if (persistedSpot) {
        const isLocked =
          persistedSpot.status === ParkingSpotStatus.RESERVED ||
          persistedSpot.status === ParkingSpotStatus.RESERVED_CHECK;

        return {
          ...persistedSpot,
          ...incomingSpotDTO,
          status: isLocked ? persistedSpot.status : incomingSpotDTO.status,
        };
      }

      return incomingSpotDTO;
    });

    const formattedResponseData = (
      await this._parkingSpotRepository.save(spotsToPersist)
    ).map((updatedSpot) => ({
      id: updatedSpot.id,
      spotName: updatedSpot.spotName,
      status: updatedSpot.status,
      sensorId: updatedSpot.sensorId,
    }));

    return {
      status: 'success',
      updatedParkingSpots: formattedResponseData,
    };
  }
}
