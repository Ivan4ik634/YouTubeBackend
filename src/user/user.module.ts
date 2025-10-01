import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Code, CodeSchema } from 'src/schemes/Code.schema';
import { Setting, SettingSchema } from 'src/schemes/Setting.schema';
import { Subscribe, SubscribeSchema } from 'src/schemes/Subscribes.schema';
import { User, UserSchema } from 'src/schemes/User.schema';
import { Video, VideoSchema } from 'src/schemes/Video.schema';
import { StatistickModule } from 'src/statistick/statistick.module';
import { TotpModule } from 'src/totp/totp.module';
import { NotificationModule } from '../notification/notification.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Code.name, schema: CodeSchema }]),
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
    MongooseModule.forFeature([{ name: Subscribe.name, schema: SubscribeSchema }]),
    NotificationModule,
    TotpModule,
    StatistickModule,
  ],
  controllers: [UserController],
  providers: [UserService, JwtService],
})
export class UserModule {}
