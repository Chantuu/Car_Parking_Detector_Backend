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
  parkingSpotReservedErrorMessage,
  parkingSpotTakenErrorMessage,
  reservationNotFoundErroMessage,
} from 'src/helper/messages/messages.variables';
import { CreateReservationDTO } from './DTOs/create-reservation.dto';
import { ParkingService } from 'src/parking/parking.service';
import { ReservationStatus } from 'src/helper/enums/reservation-status.enum';
import { EditReservationDTO } from './DTOs/edit-reservation.dto';
import { ParkingSpotStatus } from 'src/helper/enums/parking-spot-status.enum';

/**
 * This service is used to control reservation related logic.
 */
@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private _reservationRepository: Repository<Reservation>,
    private _parkingService: ParkingService,
  ) {}

  /**
   * This method formats reservation data for sending it as response data.
   *
   * @param reservation - Desired reservation entity to be formatted.
   * @param currentUser - User currently signed in.
   * @returns Formatted reservation data
   */
  private formatReservationData(reservation: Reservation, currentUser: User) {
    return {
      id: reservation.id,
      userId: currentUser.id,
      parkingSpotId: reservation.parkingSpot.id,
      startTime: reservation.startTime,
      status: reservation.status,
    };
  }

  /**
   * This method returns currently active reservation for the current user, if
   * it has already activated reservation.
   *
   * @param currentUser - User currently signed in.
   * @returns Promise containing formatted active reservation data
   * @throws NotFoundException if current user does not have active reservation
   */
  async getCurrentActiveReservation(currentUser: User) {
    const activeReservation = await this._reservationRepository.findOne({
      where: [{ user: currentUser, status: ReservationStatus.ACTIVE }],
      relations: { parkingSpot: true },
    });

    if (activeReservation) {
      return this.formatReservationData(activeReservation, currentUser);
    } else {
      throw new NotFoundException(activeReservationNotFoundErrorMessage);
    }
  }

  /**
   * This method returns all reservations associated to current user,
   * if they exist.
   *
   * @param currentUser - User currently signed in.
   * @returns Promise containing formatted reservation data list
   */
  async getAllReservation(currentUser: User) {
    const reservationEntityList = await this._reservationRepository.find({
      where: { user: currentUser },
      relations: { parkingSpot: true },
    });

    // If reservations exist for current user
    if (reservationEntityList.length) {
      return reservationEntityList.map((reservationEntity) =>
        this.formatReservationData(reservationEntity, currentUser),
      );
    } else {
      throw new BadRequestException(reservationNotFoundErroMessage);
    }
  }

  /**
   * This method creates new active reservation for current user, if
   * it does not already have active reservation.
   *
   * @param currentUser - User currently signed in.
   * @param createReservationDTO - Validated request body containing reservation creation data.
   * @returns Promise containing newly created active reservation data
   * @throws BadRequestException when active reservation already exists
   * @throws BadRequestException when parking spot is already taken
   * @throws BadRequestException when parking spot with supplied id does not exist
   */
  async createReservation(
    currentUser: User,
    createReservationDTO: CreateReservationDTO,
  ) {
    // Check for active reservation existence for user
    const isActiveReservation = await this._reservationRepository.findOne({
      where: { user: currentUser, status: ReservationStatus.ACTIVE },
    });
    // Check if parking spot exists with that id
    const currentParkingSpot = await this._parkingService.getParkingSpotById(
      createReservationDTO.parkingSpotId,
    );

    const parkingSpotHasActiveResevation =
      currentParkingSpot?.status === ParkingSpotStatus.RESERVED ||
      currentParkingSpot?.status === ParkingSpotStatus.RESERVED_CHECK;
    const parkingSpotIsFree =
      currentParkingSpot?.status === ParkingSpotStatus.FREE;

    // If current user does not have active reservation, while parking spot id is correct and
    // that parking spot does not have active reservation and is free
    if (
      !isActiveReservation &&
      currentParkingSpot &&
      !parkingSpotHasActiveResevation &&
      parkingSpotIsFree
    ) {
      // Update current parking spot to be reserved
      currentParkingSpot.status = ParkingSpotStatus.RESERVED;
      const newReservation = this._reservationRepository.create({
        user: currentUser,
        parkingSpot: currentParkingSpot,
        startTime: new Date(),
      });

      await this._reservationRepository.save(newReservation);

      return this.formatReservationData(newReservation, currentUser);
    }
    // If current user does not have active reservation, while parking spot id is correct and
    // that parking spot does not have active reservation, but is taken
    else if (
      !isActiveReservation &&
      currentParkingSpot &&
      !parkingSpotHasActiveResevation &&
      !parkingSpotIsFree
    ) {
      throw new BadRequestException(parkingSpotTakenErrorMessage);
    }
    // If current user does not have active reservation, while parking spot id is correct, but
    // that parking spot has active reservation
    else if (
      !isActiveReservation &&
      currentParkingSpot &&
      parkingSpotHasActiveResevation
    ) {
      throw new BadRequestException(parkingSpotReservedErrorMessage);
    }
    // If parking spot with that id does not exist
    else if (!currentParkingSpot) {
      throw new BadRequestException(parkingSpotIdErrorMessage);
    } else {
      throw new BadRequestException(activeReservationAlreadyExitsErrorMessage);
    }
  }

  /**
   * This method edits current user's active reservation to mark it's cancellation
   * or completion, only when it has active reservation.
   *
   * @param currentUser - User currently signed in.
   * @param editReservationDTO - Validated request body containing reservation edit data.
   * @returns Promise containing edited reservation data
   * @throws NotFoundException when activer reservation for current user is not found
   */
  async editActiveReservation(
    currentUser: User,
    editReservationDTO: EditReservationDTO,
  ) {
    // Check for active reservation existence
    const currentActiveReservation = await this._reservationRepository.findOne({
      where: [{ user: currentUser, status: ReservationStatus.ACTIVE }],
      relations: { parkingSpot: true },
    });

    // If active reservation exists
    if (currentActiveReservation) {
      currentActiveReservation.status = editReservationDTO.status;
      currentActiveReservation.parkingSpot.status =
        ParkingSpotStatus.RESERVED_CHECK;
      await this._reservationRepository.save(currentActiveReservation);

      return this.formatReservationData(currentActiveReservation, currentUser);
    } else {
      throw new NotFoundException(activeReservationNotFoundErrorMessage);
    }
  }
}
