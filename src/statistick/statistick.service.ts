import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import { Model } from 'mongoose';
import { Day, DayWallet, Month, MonthWallet, Statistick, StatistickWallet } from 'src/schemes/Statistick.schema';

@Injectable()
export class StatistickService {
  constructor(
    @InjectModel(Day.name) private day: Model<Day>,
    @InjectModel(Month.name) private month: Model<Month>,
    @InjectModel(Statistick.name) private statistick: Model<Statistick>,
    @InjectModel(DayWallet.name) private dayWallet: Model<DayWallet>,
    @InjectModel(MonthWallet.name) private monthWallet: Model<MonthWallet>,
    @InjectModel(StatistickWallet.name) private statistickWallet: Model<StatistickWallet>,
  ) {}

  /**
   * Creates a new Statistick document for the given videoId.
   * Creates a Month document for the current month and videoId.
   * Creates a Day document for each day in the current month.
   * Adds the dayId to the Month document.
   * Creates a Statistick document with the videoId and monthId.
   * @param videoId the id of the video
   */
  async createStatistickVideo(videoId: string) {
    const today = dayjs();
    const month = today.format('MM');
    const daysInMonth = today.daysInMonth();
    const days: number[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    await this.month.create({ month, videoId, days: [] });
    for (let i = 0; i < days.length; i++) {
      const day = await this.day.create({ day: days[i], videoId });

      await this.month.updateOne({ month, videoId }, { $push: { days: day._id } });
    }
    const monthUpdated = await this.month.findOne({ month, videoId });
    await this.statistick.create({ video: videoId, statistick: monthUpdated });
  }
  /**
   * Updates the daily statistics for the given videoId.
   * @param videoId the id of the video
   * @param likes the number of likes to increment
   * @param views the number of views to increment
   * @param comments the number of comments to increment
   */
  async editStatistickVideo(videoId: string, likes: number, views: number, comments: number) {
    const today = dayjs();
    const day = await this.day.findOneAndUpdate(
      { videoId, day: today.date() },
      {
        $inc: {
          views: views,
          likes: likes,
          comments: comments,
        },
      },
    );
  }
  async getStatistickVideo(userId: string, videoId: string) {
    const statistick = await this.statistick
      .findOne({ video: videoId })
      .populate({ path: 'statistick', populate: { path: 'days' } });
    if (!statistick) return 'Statistick not found';
    return statistick;
  }
  async deleteStatistickVideo(videoId: string) {
    await this.statistick.deleteOne({ video: videoId });
    await this.month.deleteMany({ videoId });
    await this.day.deleteMany({ videoId });
  }
  async createStatistick(userId: string) {
    const today = dayjs();
    const month = today.format('MM');
    const daysInMonth = today.daysInMonth();
    const days: number[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    await this.monthWallet.create({ month, userId, days: [] });
    for (let i = 0; i < days.length; i++) {
      const day = await this.dayWallet.create({ day: days[i], userId });

      await this.monthWallet.updateOne({ month, userId }, { $push: { days: day._id } });
    }
    const monthUpdated = await this.monthWallet.findOne({ month, userId });
    await this.statistickWallet.create({ user: userId, statistick: monthUpdated });
  }
  async getStatistickWallet(userId: string) {
    const statistick = await this.statistickWallet
      .findOne({ user: userId })
      .populate({ path: 'statistickWallet', populate: { path: 'days' } });
    if (!statistick) return 'Statistick not found';
    return statistick;
  }
}
