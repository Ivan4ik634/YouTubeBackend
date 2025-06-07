import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { VideoModule } from './video/video.module';
import { EmailModule } from './email/email.module';
import { UploadModule } from './upload/upload.module';
import { HistoryModule } from './history/history.module';
import { PassModule } from './pass/pass.module';
import { PlaylistModule } from './playlist/playlist.module';
import { NotificationModule } from './notification/notification.module';
import { CommentModule } from './comment/comment.module';
import { TotpModule } from './totp/totp.module';
import { HttpModule } from '@nestjs/axios';
import { SettingModule } from './setting/setting.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://admin:wwwwww@youtube.zrznmor.mongodb.net/?retryWrites=true&w=majority&appName=Youtube',
    ),
    HttpModule.register({
      timeout: 1000000, // 10 секунд, можешь поставить больше
      maxRedirects: 5,
    }),

    UserModule,
    VideoModule,
    EmailModule,
    UploadModule,
    HistoryModule,
    PassModule,
    PlaylistModule,
    NotificationModule,
    CommentModule,
    TotpModule,
    SettingModule,
  ],
})
export class AppModule {}
