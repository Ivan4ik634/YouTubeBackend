import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueryFindAll } from 'src/common/dto/queryFindAll';
import { Payment } from 'src/schemes/Payment.schema';
import { Transfer } from 'src/schemes/Transfer.schema';
import { User } from 'src/schemes/User.schema';
import { StatistickService } from 'src/statistick/statistick.service';
import Stripe from 'stripe';

@Injectable()
// API STRAPI
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private payment: Model<Payment>,
    @InjectModel(User.name) private user: Model<User>,
    @InjectModel(Transfer.name) private transfer: Model<Transfer>,
    private readonly statistick: StatistickService,
  ) {
    this.stripe = new Stripe(process.env.STRAPI_API_KEY!);
  }

  async createCheckoutSession(amount: number, userId: string) {
    const user = await this.user.findById(userId);
    if (!user) return;
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Account replenishment',
            },
            unit_amount: amount * 100, // в центах
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
      success_url: `https://white-youtube.vercel.app/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://white-youtube.vercel.app/cancel?session_id={CHECKOUT_SESSION_ID}`,
    });

    await this.payment.create({ paymentId: session.id, status: 'pending', amount, userId: user._id });
    return session; // редиректить сюда
  }
  async successPayment(body: { paymentId: string; transferId: string }, userId: string) {
    const existingTransfer = await this.transfer.findOne({ transferId: body.transferId });
    if (existingTransfer) return 'There is already such a transaction!';

    const payment = await this.payment.findOneAndUpdate(
      { paymentId: body.paymentId, status: 'pending' },
      { status: 'success' },
    );

    if (!payment) return 'Payment not found or already processed';

    if (String(payment.userId) !== userId) return 'You can`t pay for yourself';

    const user = await this.user.findById(userId);
    if (!user) return 'User not found';

    await this.transfer.create({
      from: null,
      to: user._id,
      transferId: body.transferId,
      amount: payment.amount * 100,
      type: 'payment',
    });
    await this.statistick.editStatistickWallet(String(user._id), payment.amount * 100);
    await this.user.findOneAndUpdate({ _id: user._id }, { $inc: { balance: payment.amount * 100 } });

    return { message: 'Payment processed successfully' };
  }

  async cancelPayment(paymentId: string, userId: string) {
    const payment = await this.payment.findOne({ paymentId: paymentId });
    if (!payment) return 'Payment not found';
    if (payment.status === 'pending') {
      const user = await this.user.findById(userId);

      if (!user) return 'User not found';
      if (String(user._id) !== payment.userId) return 'You can`t pay for yourself';
      await this.payment.updateOne({ paymentId: paymentId }, { status: 'error' });
      await payment.save();
      return 'Payment canceled!';
    }
  }
  async moneyTransfer(body: { amount: string | number; userTransfer: string; transferId: string }, userId: string) {
    const user = await this.user.findById(userId);
    const userTransfer = await this.user.findOne({ username: body.userTransfer });
    const transfer = await this.transfer.findOne({ transferId: body.transferId });
    if (transfer) return { message: 'There is already such a transaction!' };
    if (!userTransfer) return { message: 'User not found' };
    if (!user) return { message: 'User not found' };
    if (user.username === userTransfer.username) return { message: "You can't send coins to yourself" };
    const amount = Number(body.amount);
    if (user.balance >= amount) {
      console.log({
        userBalance: user.balance,
        userTransferBalance: userTransfer.balance,
        amount,
        typeofUserBalance: typeof user.balance,
        typeofUserTransferBalance: typeof userTransfer.balance,
        typeofAmount: typeof amount,
      });
      const updatedUser = await this.user.findOneAndUpdate({ _id: user._id }, { balance: user.balance - amount });
      await this.user.findOneAndUpdate(
        { _id: userTransfer._id },
        { balance: Number(userTransfer.balance) + Number(amount) },
      );

      const transfer = await this.transfer.create({
        from: user._id,
        transferId: body.transferId,
        to: userTransfer._id,
        amount,
        type: 'transfer',
      });
      await this.statistick.editStatistickWallet(String(user._id), -Number(amount));
      await this.statistick.editStatistickWallet(String(userTransfer._id), Number(amount));
      return { ...transfer, message: 'The transfer was successful' };
    }
  }
  async getTransfer(query: QueryFindAll, userId: string) {
    const user = await this.user.findById(userId);
    if (!user) return 'User not found';
    return this.transfer
      .find({ $or: [{ from: user._id }, { to: user._id }] })
      .sort({ _id: -1, createdAt: -1 })
      .limit(query.limit)
      .skip((query.page - 1) * query.limit);
  }
}
