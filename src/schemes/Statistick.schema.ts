import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DayDocument = HydratedDocument<Day>;
@Schema()
export class Day {
  @Prop()
  day: number;

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
