import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VideoDocument = HydratedDocument<Video>;

@Schema()
export class Video {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: false })
  preview: string;

  @Prop({ type: Boolean, default: false })
  isCommentDisabled: boolean;

  @Prop({ type: [String], required: true })
  video: string[];

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Number, default: 0 })
  price: number;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  purchasedBy: Types.ObjectId[];

  @Prop({ type: [String], required: true })
  tags: string[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  likes: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  likesCount: number;

  @Prop({ type: [Types.ObjectId], ref: 'Report', default: [] })
  reports: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  commentsCount: number;

  @Prop({ type: Number, default: 0 })
  views: number;

  @Prop({ default: false })
  isHidden: boolean;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ default: Date.now() })
  createdAt: Date;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
