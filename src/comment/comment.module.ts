import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema } from 'src/schemes/Comment.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { JwtService } from '@nestjs/jwt';
import { VideoSchema } from 'src/schemes/Video.schema';
import { UserSchema } from 'src/schemes/User.schema';
import { Setting, SettingSchema } from 'src/schemes/Setting.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: 'Video', schema: VideoSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),

    NotificationModule,
  ],
  controllers: [CommentController],
  providers: [CommentService, JwtService],
})
export class CommentModule {}
