import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type HistoryVideoDocument = HydratedDocument<HistoryVideo>;

@Schema()
export class HistoryVideo {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Video', required: true })
  videoId: Types.ObjectId;
}

export const HistoryVideoSchema = SchemaFactory.createForClass(HistoryVideo);
