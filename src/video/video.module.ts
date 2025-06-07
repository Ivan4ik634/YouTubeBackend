import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from 'src/schemes/Video.schema';
import {
  HistoryVideo,
  HistoryVideoSchema,
} from 'src/schemes/HistoryVideo.schema';
import { PlayList, PlayListSchema } from 'src/schemes/PlayList.schema';
import { JwtService } from '@nestjs/jwt';
import { NotificationModule } from '../notification/notification.module';
import { User, UserSchema } from 'src/schemes/User.schema';
import {
  PlayListVideo,
  PlayListVideoSchema,
} from 'src/schemes/PlayListVideo.schema';
import { Setting, SettingSchema } from 'src/schemes/Setting.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    MongooseModule.forFeature([
      { name: HistoryVideo.name, schema: HistoryVideoSchema },
    ]),
    MongooseModule.forFeature([
      { name: PlayListVideo.name, schema: PlayListVideoSchema },
    ]),
    MongooseModule.forFeature([
      { name: PlayList.name, schema: PlayListSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
    NotificationModule,
  ],
  controllers: [VideoController],
  providers: [VideoService, JwtService],
})
export class VideoModule {}
