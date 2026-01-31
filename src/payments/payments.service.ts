import { BadRequestException, Injectable } from '@nestjs/common';
import { AddPaymentCardDTO } from './DTOs/add-payment-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentCard } from './payment-card.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { EncryptionService } from 'src/encryption/encryption.service';
import {
  creditCardAlreadyExistsErrorMessage,
  invalidCardCredentialErrorMessage,
} from 'src/helper/messages/messages.variables';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentCard)
    private _paymentCardRepository: Repository<PaymentCard>,
    private _encryptionService: EncryptionService,
  ) {}

  addPaymentCard(addPaymentCardDTO: AddPaymentCardDTO, user: User) {
    if (!user.paymentCard) {
      const currentDate = new Date(Date.now());

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

        return this._paymentCardRepository.save(newPaymentCard);
      } else {
        throw new BadRequestException(invalidCardCredentialErrorMessage);
      }
    } else {
      throw new BadRequestException(creditCardAlreadyExistsErrorMessage);
    }
  }
}
