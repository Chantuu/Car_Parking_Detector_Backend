import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { AddPaymentCardDTO } from './DTOs/add-payment-card.dto';
import { PaymentsService } from './payments.service';
import { CurrentUser } from 'src/helper/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { PayDTO } from './DTOs/pay.dto';
import { successResponse } from 'src/helper/functions/success-response.function';

/**
 * This controller is used to manage routing for the payment endpoints.
 * Whole controller is protected AuthGuard.
 */
@Controller('api/payments')
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(private _paymentsService: PaymentsService) {}

  /**
   * This endpoint is used to get payment card of the currently
   * signed in user.
   *
   * @param currentUser - Current user obtained by Param decorator.
   * @returns Promise containing current user's payment card
   */
  @Get('paymentCard')
  async getPaymentCard(@CurrentUser() currentUser: User) {
    const paymentCard = await this._paymentsService.getPaymentCard(currentUser);
    return successResponse('success', paymentCard);
  }

  /**
   * This endpoint is used to add new payment card for the currently
   * signed in user.
   *
   * @param addPaymentCardDto - Request body containing payment card data.
   * @param currentUser - Current user obtained by Param decorator.
   * @returns Promise containing newly created payment card
   */
  @Post('paymentCard')
  async addPaymentCard(
    @Body() addPaymentCardDto: AddPaymentCardDTO,
    @CurrentUser() currentUser: User,
  ) {
    const paymentCard = await this._paymentsService.addPaymentCard(
      addPaymentCardDto,
      currentUser,
    );
    return successResponse('success', paymentCard);
  }

  /**
   * This endpoint is used to delete payment card of the currently
   * signed in user.
   *
   * @param currentUser - Current user obtained by Param decorator.
   * @returns Promise containing deleted payment card
   */
  @Delete('paymentCard')
  async deletePaymentCard(@CurrentUser() currentUser: User) {
    const paymentCard =
      await this._paymentsService.deletePaymentCard(currentUser);
    return successResponse('success', paymentCard);
  }

  /**
   * This endpoint is used to make payment for the currently
   * signed in user
   *
   * @param payDTO - Request body containing payment initialization data.
   * @param currentUser - Current user obtained by Param decorator.
   * @returns Promise containing payment result
   */
  @Post('pay')
  async pay(@Body() payDTO: PayDTO, @CurrentUser() currentUser: User) {
    const paymentTransactionData = await this._paymentsService.pay(
      payDTO,
      currentUser,
    );
    return successResponse('success', paymentTransactionData);
  }
}
