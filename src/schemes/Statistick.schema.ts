import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DayDocument = HydratedDocument<Day>;
@Schema()
export class Day {
  @Prop()
  day: number;

  @Prop()
  month: string;

  @Prop()
  videoId: string;

  @Prop({ type: Number, default: 0 })
  views: number;

  @Prop({ type: Number, default: 0 })
  likes: number;

  @Prop({ type: Number, default: 0 })
  comments: number;
}

export const DaySchema = SchemaFactory.createForClass(Day);

export type MonthDocument = HydratedDocument<Month>;
@Schema()
export class Month {
  @Prop()
  month: string;

  @Prop()
  videoId: string;

  @Prop({ type: [Types.ObjectId], ref: 'Day', default: [] })
  days: Types.ObjectId[];
}

export const MonthSchema = SchemaFactory.createForClass(Month);

export type StatistickDocument = HydratedDocument<Statistick>;
@Schema()
export class Statistick {
  @Prop({ type: Types.ObjectId, ref: 'Video', required: true })
  video: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Month', required: true })
  statistick: Types.ObjectId[];
}

export const StatistickSchema = SchemaFactory.createForClass(Statistick);

export type DayWalletDocument = HydratedDocument<DayWallet>;
@Schema()
export class DayWallet {
  @Prop()
  day: number;

  @Prop()
  month: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: Number, default: 0 })
  coins: number;
}

export const DayWalletSchema = SchemaFactory.createForClass(DayWallet);

export type MonthWalletDocument = HydratedDocument<MonthWallet>;
@Schema()
export class MonthWallet {
  @Prop()
  month: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: [Types.ObjectId], ref: 'DayWallet', default: [] })
  days: Types.ObjectId[];
}

export const MonthWalletSchema = SchemaFactory.createForClass(MonthWallet);

export type StatistickWalletDocument = HydratedDocument<StatistickWallet>;
@Schema()
export class StatistickWallet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'MonthWallet', required: true })
  statistick: Types.ObjectId[];
}

export const StatistickWalletSchema = SchemaFactory.createForClass(StatistickWallet);
