import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  HistoryVideo,
  HistoryVideoSchema,
} from 'src/schemes/HistoryVideo.schema';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HistoryVideo.name, schema: HistoryVideoSchema },
    ]),
  ],
  controllers: [HistoryController],
  providers: [HistoryService, JwtService],
})
export class HistoryModule {}
