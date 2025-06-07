import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemes/User.schema';
import { JwtService } from '@nestjs/jwt';
import { EmailModule } from 'src/email/email.module';
import { Code, CodeSchema } from 'src/schemes/Code.schema';
import { NotificationModule } from '../notification/notification.module';
import { Subscribe, SubscribeSchema } from 'src/schemes/Subscribes.schema';
import { TotpModule } from 'src/totp/totp.module';
import { Video, VideoSchema } from 'src/schemes/Video.schema';
import { Setting, SettingSchema } from 'src/schemes/Setting.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Code.name, schema: CodeSchema }]),
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
    MongooseModule.forFeature([
      { name: Subscribe.name, schema: SubscribeSchema },
    ]),
    EmailModule,
    NotificationModule,
    TotpModule,
  ],
  controllers: [UserController],
  providers: [UserService, JwtService],
})
export class UserModule {}
