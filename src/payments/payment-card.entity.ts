import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * This entity class represents payment-card table in the database.
 */
@Entity()
export class PaymentCard {
  /**
   * Primary key column.
   */
  @PrimaryGeneratedColumn('uuid')
  id: String;

  /**
   * Column containing encrypted card number.
   */
  @Column({ type: 'text', nullable: false })
  encryptedCardNumber: string;

  /**
   * Column containing card's expiration month.
   */
  @Column({ type: 'integer', nullable: false })
  cardExpirationMonth: number;

  /**
   * Column containing card's expiration year.
   */
  @Column({ type: 'integer', nullable: false })
  cardExpirationYear: number;

  /**
   * Column containing card's owner's full name.
   */
  @Column({ type: 'text', nullable: false })
  cardHolderName: string;

  /**
   * Column owner user entity, which represents One-To-One relationship.
   */
  @OneToOne(() => User, (user) => user.paymentCard, {
    nullable: true,
  })
  @JoinColumn()
  user: User;
}
