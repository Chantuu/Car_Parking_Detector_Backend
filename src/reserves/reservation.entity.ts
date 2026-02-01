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

@Entity()
/// 1. Lock: One active reservation per User
@Index('UQ_ONE_ACTIVE_RES_PER_USER', ['user'], {
  unique: true,
  where: "status = 'ACTIVE'",
})
// 2. Lock: One active user per Parking Spot
@Index('UQ_ONE_USER_PER_SPOT', ['parkingSpot'], {
  unique: true,
  where: "status = 'ACTIVE'",
})
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'datetime', nullable: false })
  startTime: Date;

  @Column({
    type: 'simple-enum',
    enum: ReservationStatus,
    default: ReservationStatus.ACTIVE,
  })
  status: ReservationStatus;

  @ManyToOne(() => User, (user) => user.reservations)
  user: User;

  @ManyToOne(() => ParkingSpot, (parkingSpot) => parkingSpot.reservations)
  parkingSpot: ParkingSpot;
}
