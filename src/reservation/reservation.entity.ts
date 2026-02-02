import { ReservationStatus } from 'src/helper/enums/reservation-status.enum';
import { ParkingSpot } from 'src/parking/parking-spot.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * This entity class represents reservation table in the database.
 */
@Entity()
/// 1. Lock: One active reservation per User
@Index('UQ_ONE_ACTIVE_RES_PER_USER', ['user', 'parkingSpot'], {
  unique: true,
  where: "status = 'ACTIVE'",
})
export class Reservation {
  /**
   * Primary key column.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Column containing starting time of the reservation.
   */
  @Column({ type: 'datetime', nullable: false })
  startTime: Date;

  /**
   * Column containing current status of the reservation with
   * default value being ACTIVE.
   */
  @Column({
    type: 'simple-enum',
    enum: ReservationStatus,
    default: ReservationStatus.ACTIVE,
  })
  status: ReservationStatus;

  /**
   * Column containing User entity, which represents Many-To-One relationship.
   */
  @ManyToOne(() => User, (user) => user.reservations)
  user: User;

  /**
   * Column containing ParkingSpot entity, which represents Many-To-One relationship.
   */
  @ManyToOne(() => ParkingSpot, (parkingSpot) => parkingSpot.reservations, {
    cascade: true,
  })
  parkingSpot: ParkingSpot;
}
