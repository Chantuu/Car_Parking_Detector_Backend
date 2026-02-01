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
@Index('UQ_ACTIVE_USER', ['user'], { unique: true, where: 'isActive = 1' })
// 2. Lock: One active user per Parking Spot
@Index('UQ_ACTIVE_SPOT', ['parkingSpot'], {
  unique: true,
  where: 'isActive = 1',
})
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'datetime', nullable: false })
  startTime: Date;

  @Column({ type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.reservations)
  user: User;

  @ManyToOne(() => ParkingSpot, (parkingSpot) => parkingSpot.reservations)
  parkingSpot: ParkingSpot;
}
