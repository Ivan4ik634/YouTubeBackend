import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CodeDocument = HydratedDocument<Code>;

@Schema()
export class Code {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop({ type: String, required: true })
  code: string;
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const CodeSchema = SchemaFactory.createForClass(Code);
