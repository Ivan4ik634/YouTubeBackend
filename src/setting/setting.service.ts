import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting } from 'src/schemes/Setting.schema';
import { User } from 'src/schemes/User.schema';
import {
  EditSettingNotificationI,
  EditSettingNotificationT,
} from './dto/EditSettingNotificationI';

@Injectable()
export class SettingService {
  constructor(
    @InjectModel(User.name) private user: Model<User>,
    @InjectModel(Setting.name) private setting: Model<Setting>,
  ) {}
  async settingNotification(userId: string) {
    const user = await this.user.findById(userId);
    if (!user) return 'Профиля нету';
    const setting = await this.setting.findOne({ userId: user._id });
    console.log(setting);
    return setting;
  }
  async EditSettingNotification(
    userId: string,
    body: EditSettingNotificationI,
  ) {
    const user = await this.user.findById(userId);
    if (!user) return;
    console.log(body);
    await this.setting.updateOne(
      { userId: user._id },
      {
        websiteNotification: body.SettingNotification.websiteNotification,
        subscribeNotification: body.SettingNotification.subscribeNotification,
        emailNotification: true,
        commentNotification: body.SettingNotification.commentNotification,
        likeNotification: body.SettingNotification.likeNotification,
      },
    );
    return 'Обновилось';
  }
}
