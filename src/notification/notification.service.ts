import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QueryFindAll } from 'src/common/dto/queryFindAll';
import { Notification } from 'src/schemes/Notifications.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notification: Model<Notification>,
  ) {}
  async findAll(query: QueryFindAll, userId: string) {
    console.log(userId);
    const skip = (query.page - 1) * query.limit;
    const notifications = await this.notification
      .find({ userId: String(userId) })
      .sort({ createdAt: -1 })
      .limit(query.limit)
      .skip(skip);
    console.log(notifications);
    return notifications;
  }
  async createNotification(
    dto: { text: string },
    userId: string | Types.ObjectId,
  ) {
    console.log(userId);
    const user = String(userId);
    const notificationCreate = await this.notification.create({
      text: dto.text,
      userId: user,
    });
    await notificationCreate.save();
    return notificationCreate;
  }
  async readNotification(userId: string) {
    return await this.notification.updateMany(
      { userId: userId, isRead: false },
      { isRead: true },
    );
  }
  async deleteOne(id: string, userId: string) {
    return await this.notification.deleteOne({ _id: id, userId: userId });
  }
  async deleteAll(userId: string) {
    return await this.notification.deleteMany({ userId: userId });
  }
}
