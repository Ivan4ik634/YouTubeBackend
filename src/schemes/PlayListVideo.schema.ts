import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PlayListVideoDocument = HydratedDocument<PlayListVideo>;

@Schema()
export class PlayListVideo {
  @Prop({ type: Types.ObjectId, ref: 'PlayList', required: true })
  playlist: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Video', required: true })
  video: Types.ObjectId;
}

export const PlayListVideoSchema = SchemaFactory.createForClass(PlayListVideo);
