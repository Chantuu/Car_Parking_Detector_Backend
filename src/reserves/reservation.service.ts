import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './reservation.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import {
  activeReservationAlreadyExitsErrorMessage,
  parkingSpotIdErrorMessage,
} from 'src/helper/messages/messages.variables';
import { CreateReservationDTO } from './DTOs/create-reservation.dto';
import { ParkingService } from 'src/parking/parking.service';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private _reservationRepository: Repository<Reservation>,
    private _parkingService: ParkingService,
  ) {}

  async createReservation(
    currentUser: User,
    createReservationDTO: CreateReservationDTO,
  ) {
    const isActiveReservation = await this._reservationRepository.findOne({
      where: { user: currentUser },
    });
    const currentParkingSpot = await this._parkingService.getParkingSpotById(
      createReservationDTO.parkingSpotId,
    );

    if (!isActiveReservation && currentParkingSpot) {
      const newReservation = this._reservationRepository.create({
        user: currentUser,
        parkingSpot: currentParkingSpot,
        startTime: new Date(),
      });

      await this._reservationRepository.save(newReservation);

      return {
        status: 'success',
        data: {
          id: newReservation.id,
          userId: currentUser.id,
          parkingSpotId: currentParkingSpot.id,
          startTime: newReservation.startTime,
          status: newReservation.status,
        },
      };
    } else if (!currentParkingSpot) {
      throw new BadRequestException(parkingSpotIdErrorMessage);
    } else {
      throw new BadRequestException(activeReservationAlreadyExitsErrorMessage);
    }
  }
}
