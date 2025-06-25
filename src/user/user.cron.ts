import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { PushNotificationService } from 'src/push-notification/push-notification.service';
import { User } from 'src/schemes/User.schema';

@Injectable()
export class UserCron {
  constructor(
    @InjectModel(User.name) private readonly user: Model<User>,
    private readonly pushNotification: PushNotificationService,
  ) {}

  @Cron('0 0 * * *')
  async addCheckUser() {
    const users = await this.user.find({
      $expr: {
        $gt: [{ $size: '$subscribers' }, 1000],
      },
    });

    for (const user of users) {
      await this.user.updateOne({ _id: user._id }, { isCheck: true });
      await this.pushNotification.sendPushNotification(
        user.playerIds,
        'You have a check mark',
        'You already have 1 thousand followers and you are given a check mark',
      );
    }
  }
}
