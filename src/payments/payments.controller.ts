import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AddPaymentCardDTO } from './DTOs/add-payment-card.dto';
import { PaymentsService } from './payments.service';
import { CurrentUser } from 'src/helper/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/payments')
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(private _paymentsService: PaymentsService) {}

  @Post('paymentCard')
  async addPaymentCard(
    @Body() addPaymentCardDto: AddPaymentCardDTO,
    @CurrentUser() user: User,
  ) {
    return await this._paymentsService.addPaymentCard(addPaymentCardDto, user);
  }
}
