import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SettingDocument = HydratedDocument<Setting>;

@Schema()
export class Setting {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  websiteNotification: boolean;

  @Prop({ type: Boolean, default: true })
  likeNotification: boolean;

  @Prop({ type: Boolean, default: true })
  subscribeNotification: boolean;

  @Prop({ type: Boolean, default: true })
  commentNotification: boolean;

  @Prop({ type: Boolean, default: true })
  emailNotification: boolean;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
