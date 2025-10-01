import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { CommentModule } from './comment/comment.module';
import { HistoryModule } from './history/history.module';
import { NotificationModule } from './notification/notification.module';
import { PassModule } from './pass/pass.module';
import { PaymentModule } from './payment/payment.module';
import { PingModule } from './ping/ping.module';
import { PlaylistModule } from './playlist/playlist.module';
import { PushNotificationModule } from './push-notification/push-notification.module';
import { SettingModule } from './setting/setting.module';
import { StatistickModule } from './statistick/statistick.module';
import { TotpModule } from './totp/totp.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://admin:wwwwww@youtube.zrznmor.mongodb.net/?retryWrites=true&w=majority&appName=Youtube',
    ),
    HttpModule.register({
      timeout: 1000000, // 10 секунд, можешь поставить больше
      maxRedirects: 5,
    }),
    ScheduleModule.forRoot(),

    UserModule,
    VideoModule,
    UploadModule,
    HistoryModule,
    PassModule,
    PlaylistModule,
    NotificationModule,
    CommentModule,
    TotpModule,
    SettingModule,
    PingModule,
    StatistickModule,
    PushNotificationModule,
    PaymentModule,
  ],
})
export class AppModule {}
