import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueryFindAll } from 'src/common/dto/queryFindAll';
import { HistoryVideo } from 'src/schemes/HistoryVideo.schema';

@Injectable()
export class HistoryService {
  constructor(@InjectModel(HistoryVideo.name) private history: Model<HistoryVideo>) {}
  async findAll(query: QueryFindAll, userId: string) {
    const skip = (query.page - 1) * query.limit;
    const history = await this.history
      .find({ userId: userId })
      .populate({ path: 'videoId', populate: { path: 'userId' } })
      .limit(query.limit)
      .skip(skip);
    console.log(history);
    return history.map((obj) => obj.videoId);
  }

  async deleteAll(userId: string) {
    return this.history.deleteMany({ userId: userId });
  }
  async deleteOne(id: string, userId: string) {
    return this.history.deleteOne({ _id: id, userId: userId });
  }
}
