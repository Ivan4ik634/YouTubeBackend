import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSchema } from 'src/schemes/Payment.schema';
import { UserSchema } from 'src/schemes/User.schema';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Payment', schema: PaymentSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, JwtService],
  exports: [PaymentService],
})
export class PaymentModule {}
