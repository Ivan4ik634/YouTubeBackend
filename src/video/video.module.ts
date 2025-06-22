import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoryVideo, HistoryVideoSchema } from 'src/schemes/HistoryVideo.schema';
import { PlayList, PlayListSchema } from 'src/schemes/PlayList.schema';
import { PlayListVideo, PlayListVideoSchema } from 'src/schemes/PlayListVideo.schema';
import { Setting, SettingSchema } from 'src/schemes/Setting.schema';
import { User, UserSchema } from 'src/schemes/User.schema';
import { Video, VideoSchema } from 'src/schemes/Video.schema';
import { StatistickModule } from 'src/statistick/statistick.module';
import { NotificationModule } from '../notification/notification.module';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    MongooseModule.forFeature([{ name: HistoryVideo.name, schema: HistoryVideoSchema }]),
    MongooseModule.forFeature([{ name: PlayListVideo.name, schema: PlayListVideoSchema }]),
    MongooseModule.forFeature([{ name: PlayList.name, schema: PlayListSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
    NotificationModule,
    StatistickModule,
  ],
  controllers: [VideoController],

  providers: [VideoService, JwtService],
})
export class VideoModule {}
