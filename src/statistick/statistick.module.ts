import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DaySchema,
  DayWalletSchema,
  MonthSchema,
  MonthWalletSchema,
  StatistickSchema,
  StatistickWalletSchema,
} from 'src/schemes/Statistick.schema';
import { User, UserSchema } from 'src/schemes/User.schema';
import { Video, VideoSchema } from 'src/schemes/Video.schema';
import { StatistickController } from './statistick.controller';
import { StatistickCron } from './statistick.cron';
import { StatistickService } from './statistick.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Statistick', schema: StatistickSchema }]),
    MongooseModule.forFeature([{ name: 'Day', schema: DaySchema }]),
    MongooseModule.forFeature([{ name: 'Month', schema: MonthSchema }]),
    MongooseModule.forFeature([{ name: 'StatistickWallet', schema: StatistickWalletSchema }]),
    MongooseModule.forFeature([{ name: 'DayWallet', schema: DayWalletSchema }]),
    MongooseModule.forFeature([{ name: 'MonthWallet', schema: MonthWalletSchema }]),
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [StatistickController],
  providers: [StatistickService, StatistickCron, JwtService],
  exports: [StatistickService],
})
export class StatistickModule {}
