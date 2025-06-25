import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { User } from 'src/schemes/User.schema';

@Injectable()
export class UserCron {
  constructor(@InjectModel(User.name) private readonly user: Model<User>) {}

  @Cron('0 0 * * *')
  async addCheckUser() {
    const users = await this.user.find({
      $expr: {
        $gt: [{ $size: '$subscribers' }, 1000],
      },
    });

    for (const user of users) {
      await this.user.updateOne({ _id: user._id }, { isCheck: true });
    }
  }
}
