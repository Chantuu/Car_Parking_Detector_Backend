import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { AddPaymentCardDTO } from './DTOs/add-payment-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentCard } from './payment-card.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { EncryptionService } from 'src/encryption/encryption.service';
import {
  paymentCardAlreadyExistsErrorMessage,
  invalidCardCredentialErrorMessage,
  paymentCardNotExistsErrorMessage,
  insufficientMoneyErrorMessage,
} from 'src/helper/messages/messages.variables';
import { PayDTO } from './DTOs/pay.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentCard)
    private _paymentCardRepository: Repository<PaymentCard>,
    private _encryptionService: EncryptionService,
    private _usersService: UsersService,
  ) {}

  private maskCardNumber(unmaskedCardNumber) {
    return `${'*'.repeat(unmaskedCardNumber.length - 4)}${unmaskedCardNumber.slice(-4)}`;
  }

  private returnPaymentCardofCurrentUser(user: User) {
    return this._paymentCardRepository.findOne({
      where: { user: { id: user.id } },
      relations: { user: true },
    });
  }

  async getPaymentCard(user: User) {
    const paymentCard = await this.returnPaymentCardofCurrentUser(user);

    if (paymentCard) {
      const decryptedCardNumber = this._encryptionService.decrypt(
        paymentCard.encryptedCardNumber,
      );
      const maskedCardNumber = this.maskCardNumber(decryptedCardNumber);

      return {
        status: 'success',
        data: {
          id: paymentCard.id,
          userId: paymentCard.user.id,
          cardNumber: maskedCardNumber,
          cardExpirationMonth: paymentCard.cardExpirationMonth,
          cardExpirationYear: paymentCard.cardExpirationYear,
          cardHolderName: paymentCard.cardHolderName,
        },
      };
    } else {
      throw new BadRequestException(paymentCardNotExistsErrorMessage);
    }
  }

  async addPaymentCard(addPaymentCardDTO: AddPaymentCardDTO, user: User) {
    if (!user.paymentCard) {
      const currentDate = new Date(Date.now());
      const rawCardNumber = addPaymentCardDTO.cardNumber;

      if (
        addPaymentCardDTO.cardExpirationMonth > currentDate.getMonth() &&
        addPaymentCardDTO.cardExpirationYear >= currentDate.getFullYear()
      ) {
        const encryptedCardNumber = this._encryptionService.encrypt(
          addPaymentCardDTO.cardNumber,
        );

        const newPaymentCard = this._paymentCardRepository.create({
          encryptedCardNumber: encryptedCardNumber,
          cardExpirationMonth: addPaymentCardDTO.cardExpirationMonth,
          cardExpirationYear: addPaymentCardDTO.cardExpirationYear,
          cardHolderName: addPaymentCardDTO.cardHolderName,
          user: user,
        });

        await this._paymentCardRepository.save(newPaymentCard);

        const maskedCardNumber = this.maskCardNumber(rawCardNumber);
        return {
          success: true,
          data: {
            id: newPaymentCard.id,
            userId: user.id,
            cardNumber: maskedCardNumber,
            cardExpirationMonth: addPaymentCardDTO.cardExpirationMonth,
            cardExpirationYear: addPaymentCardDTO.cardExpirationYear,
            cardHolderName: addPaymentCardDTO.cardHolderName,
          },
        };
      } else {
        throw new BadRequestException(invalidCardCredentialErrorMessage);
      }
    } else {
      throw new BadRequestException(paymentCardAlreadyExistsErrorMessage);
    }
  }

  async deletePaymentCard(user: User) {
    const paymentCard = await this.returnPaymentCardofCurrentUser(user);

    if (paymentCard) {
      const decryptedCardNumber = this._encryptionService.decrypt(
        paymentCard.encryptedCardNumber,
      );
      const maskedCardNumber = this.maskCardNumber(decryptedCardNumber);

      await this._paymentCardRepository.remove([paymentCard]);

      return {
        status: 'success',
        data: {
          id: paymentCard.id,
          userId: paymentCard.user.id,
          cardNumber: maskedCardNumber,
          cardExpirationMonth: paymentCard.cardExpirationMonth,
          cardExpirationYear: paymentCard.cardExpirationYear,
          cardHolderName: paymentCard.cardHolderName,
        },
      };
    } else {
      throw new BadRequestException(paymentCardNotExistsErrorMessage);
    }
  }

  //TODO: Implement Reservation logic
  async pay(payDTO: PayDTO, user: User) {
    const paymentCard = await this.returnPaymentCardofCurrentUser(user);

    if (paymentCard && user.money >= payDTO.amount) {
      user.money -= payDTO.amount;
      await this._usersService.saveUpdatedUser(user);

      return {
        status: 'success',
        data: {
          amount: payDTO.amount,
          paymentStatus: 'Completed',
        },
      };
    } else if (paymentCard && user.money < payDTO.amount) {
      throw new ConflictException(insufficientMoneyErrorMessage);
    } else {
      throw new BadRequestException(paymentCardNotExistsErrorMessage);
    }
  }
}
