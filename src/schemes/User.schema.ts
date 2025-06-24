import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: '' })
  badge: string;

  @Prop({ default: '' })
  biograffy: string;

  @Prop({ required: true })
  password: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ default: false })
  isEnabledTotp: boolean;

  @Prop({ default: false })
  hidden: boolean;

  @Prop({ default: 'public' })
  isVisibilityVideo: string;

  @Prop({ default: '' })
  codeTotp: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  blocedUsers: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], default: [] })
  subscribers: Types.ObjectId[];

  @Prop({ type: String, required: true })
  playerId: string;

  @Prop({ type: Number, default: 0 })
  videos: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
