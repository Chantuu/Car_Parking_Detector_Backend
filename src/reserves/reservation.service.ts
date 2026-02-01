import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './reservation.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import {
  activeReservationAlreadyExitsErrorMessage,
  activeReservationNotFoundErrorMessage,
  parkingSpotIdErrorMessage,
} from 'src/helper/messages/messages.variables';
import { CreateReservationDTO } from './DTOs/create-reservation.dto';
import { ParkingService } from 'src/parking/parking.service';
import { ReservationStatus } from 'src/helper/enums/reservation-status.enum';
import { EditReservationDTO } from './DTOs/edit-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private _reservationRepository: Repository<Reservation>,
    private _parkingService: ParkingService,
  ) {}

  async getCurrentActiveReservation(currentUser: User) {
    const activeReservation = await this._reservationRepository.findOne({
      where: [{ user: currentUser }, { status: ReservationStatus.ACTIVE }],
      relations: { parkingSpot: true },
    });

    if (activeReservation) {
      return {
        status: 'success',
        data: {
          id: activeReservation.id,
          userId: currentUser.id,
          parkingSpotId: activeReservation.parkingSpot.id,
          startTime: activeReservation.startTime,
          status: activeReservation.status,
        },
      };
    } else {
      throw new NotFoundException(activeReservationNotFoundErrorMessage);
    }
  }

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

  async editActiveReservation(
    currentUser: User,
    editReservationDTO: EditReservationDTO,
  ) {
    const currentActiveReservation = await this._reservationRepository.findOne({
      where: [{ user: currentUser, status: ReservationStatus.ACTIVE }],
      relations: { parkingSpot: true },
    });

    console.log(currentActiveReservation);

    if (currentActiveReservation) {
      currentActiveReservation.status = editReservationDTO.status;
      await this._reservationRepository.save(currentActiveReservation);

      return {
        status: 'success',
        data: {
          id: currentActiveReservation.id,
          userId: currentUser.id,
          parkingSpotId: currentActiveReservation.id,
          startTime: currentActiveReservation.startTime,
          status: currentActiveReservation.status,
        },
      };
    } else {
      throw new NotFoundException(activeReservationNotFoundErrorMessage);
    }
  }
}
