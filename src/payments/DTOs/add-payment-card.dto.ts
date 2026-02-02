import { IsCreditCard, IsString, IsNumber, Min, Max } from 'class-validator';

/**
 * This class is used to validate payment card request body for it's registration.
 */
export class AddPaymentCardDTO {
  /**
   * This property must be valid credit card number of type string.
   */
  @IsCreditCard()
  cardNumber: string;

  /**
   * This property must be full card holder name of type string.
   */
  @IsString()
  cardHolderName: string;

  /**
   * This property must contain correct expiration month number of the card.
   */
  @IsNumber()
  @Min(1)
  @Max(12)
  cardExpirationMonth: number;

  /**
   * This property must contain correct expiration year number of the card.
   */
  @IsNumber()
  @Min(new Date().getFullYear(), {
    message: 'Expiration year must be the current year or later',
  })
  cardExpirationYear: number;

  /**
   * This property must contain correct ccv number of the card.
   */
  @IsNumber()
  @Min(100)
  @Max(999)
  ccv: number;
}
