import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { DaySchema, MonthSchema, StatistickSchema } from 'src/schemes/Statistick.schema';
import { StatistickController } from './statistick.controller';
import { StatistickService } from './statistick.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Statistick', schema: StatistickSchema }]),
    MongooseModule.forFeature([{ name: 'Day', schema: DaySchema }]),
    MongooseModule.forFeature([{ name: 'Month', schema: MonthSchema }]),
  ],
  controllers: [StatistickController],
  providers: [StatistickService, JwtService],
  exports: [StatistickService],
})
export class StatistickModule {}
