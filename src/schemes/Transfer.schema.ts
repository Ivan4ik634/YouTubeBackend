import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TransferDocument = HydratedDocument<Transfer>;
@Schema()
export class Transfer {
  @Prop({ default:null })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  type: 'payment' | 'transfer';

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const TransferSchema = SchemaFactory.createForClass(Transfer);
