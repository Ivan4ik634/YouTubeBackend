import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PlayListDocument = HydratedDocument<PlayList>;

@Schema()
export class PlayList {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: [Types.ObjectId], ref: 'Video', default: [] })
  videosIds: Types.ObjectId[];

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  preview: string;
}

export const PlayListSchema = SchemaFactory.createForClass(PlayList);
