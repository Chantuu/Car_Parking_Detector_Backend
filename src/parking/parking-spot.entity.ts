import { ParkingSpotStatus } from 'src/helper/enums/parking-spot-status.enum';
import { Reservation } from 'src/reservation/reservation.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * This entity class represents parking-spot table in the database and is used for data management.
 */
@Entity()
export class ParkingSpot {
  /**
   * Primary key column.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Column containing unique name of the parking spot, which is not nullable.
   */
  @Column({ type: 'text', nullable: false, unique: true })
  spotName: string;

  /**
   * Column containing current status of the parking spot, which is enum and not nullable.
   */
  @Column({ type: 'simple-enum', enum: ParkingSpotStatus, nullable: false })
  status: string;

  /**
   * Column containing unique id of the parking spot sensor, which is not nullable.
   */
  @Column({ type: 'text', nullable: false, unique: true })
  sensorId: string;

  /**
   * Column containing date and time, when this entity was last updated.
   */
  @UpdateDateColumn()
  lastUpdated: Date;

  /**
   * Column containing Reservation entity list as part of One-To-Many Relationship.
   */
  @OneToMany(() => Reservation, (reservation) => reservation.parkingSpot)
  reservations: Reservation[];
}
