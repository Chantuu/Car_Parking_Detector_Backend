import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParkingSpot } from './parking-spot.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ParkingService {
  constructor(
    @InjectRepository(ParkingSpot)
    private _parkingSpotRepository: Repository<ParkingSpot>,
  ) {}

  getAllParkingSpots() {
    return this._parkingSpotRepository.find({});
  }
}
