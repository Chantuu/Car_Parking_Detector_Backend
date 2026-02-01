import { ParkingSpotStatus } from 'src/helper/enums/parking-spot-status.enum';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ParkingSpot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  spotName: string;

  @Column({ type: 'enum', enum: ParkingSpotStatus, nullable: false })
  status: string;

  @Column({ type: 'text', nullable: false, unique: true })
  sensorId: string;

  @UpdateDateColumn()
  lastUpdated: Date;
}
