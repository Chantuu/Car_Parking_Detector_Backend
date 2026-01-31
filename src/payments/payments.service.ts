import { BadRequestException, Injectable } from '@nestjs/common';
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
} from 'src/helper/messages/messages.variables';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentCard)
    private _paymentCardRepository: Repository<PaymentCard>,
    private _encryptionService: EncryptionService,
  ) {}

  private maskCardNumber(unmaskedCardNumber) {
    return `${'*'.repeat(unmaskedCardNumber.length - 4)}${unmaskedCardNumber.slice(-4)}`;
  }

  async getPaymentCard(user: User) {
    const paymentCard = await this._paymentCardRepository.findOne({
      where: { user: { id: user.id } },
      relations: { user: true },
    });

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
    const paymentCard = await this._paymentCardRepository.findOne({
      where: { user: { id: user.id } },
      relations: { user: true },
    });

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
}
