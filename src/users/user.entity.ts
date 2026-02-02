import { PaymentCard } from 'src/payments/payment-card.entity';
import { Reservation } from 'src/reservation/reservation.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * This entity class represents user table in the database.
 */
@Entity()
export class User {
  /**
   * Primary key column.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Column containing user's full name.
   */
  @Column({ type: 'text', nullable: false })
  fullName: string;

  /**
   * Column containing user's unique email.
   */
  @Column({ type: 'text', nullable: false, unique: true })
  email: string;

  /**
   * Column containing user's hashed password.
   */
  @Column({ type: 'text', nullable: false })
  passwordHashed: string;

  /**
   * Column containing user's money for reservation functionality.
   */
  @Column({ type: 'float', default: 20 })
  money: number;

  /**
   * Column containing PaymentCard entity, which represents One-To-One relationship.
   */
  @OneToOne(() => PaymentCard, (card) => card.user)
  paymentCard: PaymentCard;

  /**
   * Column containing Reservation entities, which represents One-To-Many relationship.
   */
  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];
}
