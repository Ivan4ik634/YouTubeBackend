import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueryFindAll } from 'src/common/dto/queryFindAll';
import { Payment } from 'src/schemes/Payment.schema';
import { Transfer } from 'src/schemes/Transfer.schema';
import { User } from 'src/schemes/User.schema';
import Stripe from 'stripe';

@Injectable()
// API STRAPI
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private payment: Model<Payment>,
    @InjectModel(User.name) private user: Model<User>,
    @InjectModel(Transfer.name) private transfer: Model<Transfer>,
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
              name: 'Пополнение счёта',
            },
            unit_amount: amount * 100, // в центах
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
      success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/cancel?session_id={CHECKOUT_SESSION_ID}`,
    });

    await this.payment.create({ paymentId: session.id, status: 'pending', amount, userId: user._id });
    return session; // редиректить сюда
  }
  async successPayment(paymentId: string, userId: string) {
    const payment = await this.payment.findOne({ paymentId: paymentId });
    if (!payment) return 'Payment not found';
    if (payment.status === 'pending') {
      const user = await this.user.findById(userId);

      if (!user) return 'User not found';
      if (String(user._id) !== payment.userId) return 'You can`t pay for yourself';
      const updatedUser = await this.user.findOneAndUpdate(
        { _id: user._id },
        { balance: user.balance + payment.amount * 100 },
      );

      await this.payment.updateOne({ paymentId: paymentId }, { status: 'success' });
      await this.transfer.create({ from: null, to: user._id, amount: payment.amount, type: 'payment' });

      await payment.save();
      return updatedUser;
    }
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
  async moneyTransfer(body: { amount: number; userTransfer: string }, userId: string) {
    const user = await this.user.findById(userId);
    const userTransfer = await this.user.findOne({ username: body.userTransfer });

    if (!userTransfer) return 'User not found';
    if (!user) return 'User not found';

    if (user.balance >= body.amount) {
      const updatedUser = await this.user.findOneAndUpdate({ _id: user._id }, { balance: user.balance - body.amount });
      const updatedUserTransfer = await this.user.findOneAndUpdate(
        { _id: userTransfer._id },
        { balance: userTransfer.balance + body.amount },
      );
      await this.transfer.create({ from: user._id, to: userTransfer._id, amount: body.amount, type: 'transfer' });
      return 'The transfer was successful';
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
