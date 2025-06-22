import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from 'src/notification/notification.module';
import { CommentSchema } from 'src/schemes/Comment.schema';
import { Setting, SettingSchema } from 'src/schemes/Setting.schema';
import { UserSchema } from 'src/schemes/User.schema';
import { VideoSchema } from 'src/schemes/Video.schema';
import { StatistickModule } from 'src/statistick/statistick.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: 'Video', schema: VideoSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
    StatistickModule,
    NotificationModule,
  ],
  controllers: [CommentController],
  providers: [CommentService, JwtService],
})
export class CommentModule {}
