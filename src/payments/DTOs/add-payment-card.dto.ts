import { IsCreditCard, IsString, IsNumber, Min, Max } from 'class-validator';

export class AddPaymentCardDTO {
  @IsCreditCard()
  cardNumber: string;

  @IsString()
  cardHolderName: string;

  @IsNumber()
  @Min(1)
  @Max(12)
  cardExpirationMonth: number;

  @IsNumber()
  @Min(new Date().getFullYear(), {
    message: 'Expiration year must be the current year or later',
  })
  cardExpirationYear: number;

  @IsNumber()
  @Min(100)
  @Max(999)
  ccv: number;
}
