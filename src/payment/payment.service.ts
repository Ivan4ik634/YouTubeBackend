import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from 'src/schemes/Payment.schema';
import { User } from 'src/schemes/User.schema';
import Stripe from 'stripe';

@Injectable()
// API STRAPI
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private payment: Model<Payment>,
    @InjectModel(User.name) private user: Model<User>,
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
      cancel_url: `http://localhost:3000/cancel`,
    });

    await this.payment.create({ paymentId: session.id, status: 'pending', amount, userId: user._id });
    return session; // редиректить сюда
  }
  async successPayment(paymentId: string, userId: string) {
    const payment = await this.payment.findOne({ paymentId: paymentId });
    if (!payment) return 'Payment not found';
    const user = await this.user.findById(userId);

    if (!user) return 'User not found';
    const updatedUser = await this.user.findOneAndUpdate(
      { _id: user._id },
      { balance: user.balance + payment.amount * 100 },
    );
    await this.payment.updateOne({ paymentId: paymentId }, { status: 'success' });
    await payment.save();
    return updatedUser;
  }
}
