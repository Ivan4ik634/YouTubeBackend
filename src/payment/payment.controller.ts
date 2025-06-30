import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { QueryFindAll } from 'src/common/dto/queryFindAll';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  async createPaymentIntent(@CurrectUser() userId: string, @Body() body: { amount: number }) {
    return this.paymentService.createCheckoutSession(body.amount, userId);
  }
  @Post('success')
  @UseGuards(AuthGuard)
  async successPayment(@CurrectUser() userId: string, @Body() body: { paymentId: string; transferId: string }) {
    return this.paymentService.successPayment(body, userId);
  }
  @Post('cancel')
  @UseGuards(AuthGuard)
  async cancelPayment(@CurrectUser() userId: string, @Body() body: { paymentId: string }) {
    return this.paymentService.cancelPayment(body.paymentId, userId);
  }
  @Post('transfer')
  @UseGuards(AuthGuard)
  async moneyTransfer(
    @CurrectUser() userId: string,
    @Body() body: { amount: string | number; userTransfer: string; transferId: string },
  ) {
    return this.paymentService.moneyTransfer(body, userId);
  }
  @Get('transfer')
  @UseGuards(AuthGuard)
  async getTransfer(@Query() query: QueryFindAll, @CurrectUser() userId: string) {
    return this.paymentService.getTransfer(query, userId);
  }
}
