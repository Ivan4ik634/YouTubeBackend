import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import { Model } from 'mongoose';
import { Day, DayWallet, Month, MonthWallet, Statistick, StatistickWallet } from 'src/schemes/Statistick.schema';
import { User } from 'src/schemes/User.schema';
import { Video } from 'src/schemes/Video.schema';

@Injectable()
export class StatistickCron {
  constructor(
    @InjectModel(Day.name) private day: Model<Day>,
    @InjectModel(Month.name) private month: Model<Month>,
    @InjectModel(Statistick.name) private statistick: Model<Statistick>,
    @InjectModel(Video.name) private video: Model<Video>,
    @InjectModel(User.name) private user: Model<User>,
    @InjectModel(DayWallet.name) private dayWallet: Model<DayWallet>,
    @InjectModel(MonthWallet.name) private monthWallet: Model<MonthWallet>,
    @InjectModel(StatistickWallet.name) private statistickWallet: Model<StatistickWallet>,
  ) {}

  @Cron('0 0 0 1 * *')
  async createMonthStatistickVideo() {
    const videos = await this.video.find();
    const users = await this.user.find();
    const today = dayjs();
    const month = today.format('MM');
    const daysInMonth = today.daysInMonth();
    const days: number[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    for (let i = 0; i < videos.length; i++) {
      await this.month.create({ month, videoId: String(videos[i]._id), days: [] });
      for (let i = 0; i < days.length; i++) {
        const day = await this.day.create({ day: days[i], videoId: String(videos[i]._id) });

        await this.month.updateOne({ month, videoId: String(videos[i]._id) }, { $push: { days: day._id } });
      }
      const monthUpdated = await this.month.findOne({ month, videoId: String(videos[i]._id) });
      await this.statistick.updateOne({ video: String(videos[i]._id), $push: { statistick: monthUpdated } });
    }
    for (let i = 0; i < users.length; i++) {
      await this.monthWallet.create({ month, userId: String(users[i]._id), days: [] });
      for (let i = 0; i < days.length; i++) {
        const day = await this.dayWallet.create({ day: days[i], userId: String(users[i]._id) });

        await this.monthWallet.updateOne({ month, userId: String(users[i]._id) }, { $push: { days: day._id } });
      }
      const monthUpdated = await this.monthWallet.findOne({ month, userId: String(users[i]._id) });
      await this.statistickWallet.updateOne({ user: users[i]._id, $push: { statistick: monthUpdated } });
    }
  }
}
