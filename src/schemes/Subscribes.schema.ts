import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SubscribeDocument = HydratedDocument<Subscribe>;

@Schema()
export class Subscribe {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  subscrider: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;
}

export const SubscribeSchema = SchemaFactory.createForClass(Subscribe);
