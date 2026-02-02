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
  notEnoughMoneyErrorMessage,
  noAmountPresentErrorMessage,
} from 'src/helper/messages/messages.variables';
import { PayDTO } from './DTOs/pay.dto';
import { UsersService } from 'src/users/users.service';
import { ReservationStatus } from 'src/helper/enums/reservation-status.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentCard)
    private _paymentCardRepository: Repository<PaymentCard>,
    private _encryptionService: EncryptionService,
    private _usersService: UsersService,
  ) {}

  /**
   * This helper function is used to mask raw card number string for safety.
   *
   * @param unmaskedCardNumber - Desired card number string to be masked.
   * @returns Masked card number string
   */
  private maskCardNumber(unmaskedCardNumber) {
    return `${'*'.repeat(unmaskedCardNumber.length - 4)}${unmaskedCardNumber.slice(-4)}`;
  }

  /**
   * This helper function returns correctly formatted payment card object for the
   * controller hanlder to be sent as a response.
   *
   * @param paymentCard - Payment card entity to be formatted.
   * @param maskedCardNumber - Masked card number of that payment card.
   * @returns Formatted payment card data object
   */
  private formatPaymentCardData(
    paymentCard: PaymentCard,
    maskedCardNumber: string,
  ) {
    return {
      id: paymentCard.id,
      userId: paymentCard.user.id,
      cardNumber: maskedCardNumber,
      cardExpirationMonth: paymentCard.cardExpirationMonth,
      cardExpirationYear: paymentCard.cardExpirationYear,
      cardHolderName: paymentCard.cardHolderName,
    };
  }

  /**
   * This helper method is used to return fully loaded user entity from PaymentCard Repository
   *
   * @param currentUser - User currenty signed in.
   * @returns Promise containing fully loaded user entity or null
   */
  private returnPaymentCardofCurrentUser(currentUser: User) {
    return this._paymentCardRepository.findOne({
      where: { user: { id: currentUser.id } },
      relations: { user: true },
    });
  }

  /**
   * This method returns payment card details of the current user. It has
   * protection built-in against non existing payment card
   *
   * @param currentUser - User currently signed in.
   * @returns Promise containing current user's payment card data
   * @throws BadRequestException, when user does not have payment card
   */
  async getPaymentCard(currentUser: User) {
    const paymentCard = await this.returnPaymentCardofCurrentUser(currentUser);

    if (paymentCard) {
      const decryptedCardNumber = this._encryptionService.decrypt(
        paymentCard.encryptedCardNumber,
      );
      const maskedCardNumber = this.maskCardNumber(decryptedCardNumber);

      return {
        id: paymentCard.id,
        userId: paymentCard.user.id,
        cardNumber: maskedCardNumber,
        cardExpirationMonth: paymentCard.cardExpirationMonth,
        cardExpirationYear: paymentCard.cardExpirationYear,
        cardHolderName: paymentCard.cardHolderName,
      };
    } else {
      throw new BadRequestException(paymentCardNotExistsErrorMessage);
    }
  }

  /**
   * This method is used to add new payment card for the existing user, only when
   * user does not have credit card set up.
   *
   * @param addPaymentCardDTO - Validated request body containing payment card data.
   * @param user - User currently signed in.
   * @returns Promise containing newly created payment card entity
   * @throws BadRequestException when payment card credentials are invalid
   * @throws BadRequestException when current user already has payment card
   */
  async addPaymentCard(
    addPaymentCardDTO: AddPaymentCardDTO,
    currentUser: User,
  ) {
    if (!currentUser.paymentCard) {
      const currentDate = new Date(Date.now());
      const rawCardNumber = addPaymentCardDTO.cardNumber;

      // Checking, that payment card is not expired yet
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
          user: currentUser,
        });

        await this._paymentCardRepository.save(newPaymentCard);

        const maskedCardNumber = this.maskCardNumber(rawCardNumber);

        return this.formatPaymentCardData(newPaymentCard, maskedCardNumber);
      } else {
        throw new BadRequestException(invalidCardCredentialErrorMessage);
      }
    } else {
      throw new BadRequestException(paymentCardAlreadyExistsErrorMessage);
    }
  }

  /**
   * This method is used to completely remove current user's payment card.
   *
   * @param currentUser - User currently signed in.
   * @returns Promise containing deleted payment entity
   * @throws BadRequestException if current user does not have payment card
   */
  async deletePaymentCard(currentUser: User) {
    const paymentCard = await this.returnPaymentCardofCurrentUser(currentUser);

    if (paymentCard) {
      const decryptedCardNumber = this._encryptionService.decrypt(
        paymentCard.encryptedCardNumber,
      );
      const maskedCardNumber = this.maskCardNumber(decryptedCardNumber);

      await this._paymentCardRepository.remove([paymentCard]);

      return this.formatPaymentCardData(paymentCard, maskedCardNumber);
    } else {
      throw new BadRequestException(paymentCardNotExistsErrorMessage);
    }
  }

  /**
   *
   * @param payDTO
   * @param currentUser
   */
  async pay(payDTO: PayDTO, currentUser: User) {
    const paymentCard = await this.returnPaymentCardofCurrentUser(currentUser);

    // If payment card exists
    if (paymentCard) {
      const responsePaymentTransactionData = {
        paymentStatus: 'Completed',
        paidAmount: 0,
      };

      // If reservation was cancelled by the user
      if (payDTO.reservationStatus === ReservationStatus.CANCELLED) {
        currentUser.money -= 1;

        await this._usersService.saveUpdatedUser(currentUser);

        responsePaymentTransactionData.paidAmount = 1;
      }
      // If reservation was checked in by the user
      else if (payDTO.reservationStatus === ReservationStatus.COMPLETED) {
        // If amount is present in request body and user has enough money
        if (payDTO.amount && currentUser.money >= payDTO.amount) {
          currentUser.money -= payDTO.amount;

          await this._usersService.saveUpdatedUser(currentUser);

          responsePaymentTransactionData.paidAmount = payDTO.amount;
        }
        // If amount is present in request body but user does not have enough money
        else if (payDTO.amount && currentUser.money < payDTO.amount) {
          throw new BadRequestException(notEnoughMoneyErrorMessage);
        } else {
          throw new BadRequestException(noAmountPresentErrorMessage);
        }
      }

      return responsePaymentTransactionData;
    } else {
      throw new BadRequestException(paymentCardNotExistsErrorMessage);
    }
  }
}
