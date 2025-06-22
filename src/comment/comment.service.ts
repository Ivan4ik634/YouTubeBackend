import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationService } from 'src/notification/notification.service';
import { Comment } from 'src/schemes/Comment.schema';
import { Setting } from 'src/schemes/Setting.schema';
import { User } from 'src/schemes/User.schema';
import { Video } from 'src/schemes/Video.schema';
import { StatistickService } from 'src/statistick/statistick.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryVideoFindALl } from './dto/query';
import { updateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private comment: Model<Comment>,
    @InjectModel(Video.name) private video: Model<Video>,
    @InjectModel(User.name) private user: Model<User>,
    @InjectModel(Setting.name) private setting: Model<Setting>,
    private readonly notification: NotificationService,
    private readonly statistick: StatistickService,
  ) {}

  async create(userId: string, createCommentDto: CreateCommentDto) {
    const video = await this.video.findOne({ _id: createCommentDto.videoId });

    if (!video) return 'Видео не найдено!';

    const setting = await this.setting.findOne({
      userId: String(video.userId),
    });
    if (video.isCommentDisabled) return 'Комментарии отключены';

    const newComment = new this.comment({
      text: createCommentDto.text,
      userId,
      videoId: createCommentDto.videoId,
    });

    video.commentsCount = video.commentsCount + 1;
    await this.statistick.editStatistickVideo(String(video._id), 0, 0, 1);

    await video.save();
    await newComment.save();

    const comment = (await this.comment.findOne({ _id: newComment._id }).populate('userId').populate('videoId')) as any;

    if (!comment) return 'Comment not found';
    if (setting?.websiteNotification && setting?.commentNotification) {
      await this.notification.createNotification({ text: `New comments in video: ${video.title}` }, video.userId);
    }

    return comment;
  }

  async findAll(query: QueryVideoFindALl) {
    const comments = await this.comment
      .find({ videoId: query.videoId })
      .limit(query.limit)
      .skip((query.page - 1) * query.limit)
      .populate('userId')
      .sort({ createdAt: -1, _id: -1 });
    return comments;
  }

  async update(userId: string, dto: updateCommentDto) {
    const comment = await this.comment.findOne({ _id: dto.commentId });
    if (!comment) return 'Comment not found';
    if (String(comment.userId) !== userId) return 'User does not have permission to update this comment';
    await this.comment.updateOne({ _id: dto.commentId }, { text: dto.text });
    await comment.save();
    return comment;
  }

  async remove(userId: string, dto: string) {
    const comment = await this.comment.findOne({ _id: dto }).populate<{ videoId: Video }>('videoId');
    if (!comment) return 'Такого комента немає';

    if (String(comment?.userId) !== userId || String(comment.videoId.userId) !== userId)
      return 'User does not have permission to delete this comment';

    await this.video.updateOne({ _id: comment.videoId }, { $inc: { commentsCount: -1 } });
    await this.statistick.editStatistickVideo(String(comment.videoId), 0, 0, -1);
    await this.comment.deleteOne({ _id: dto });

    return comment;
  }
  async like(userId: string, dto: { commentId: string }) {
    const user = await this.user.findOne({ _id: userId });
    const comment = await this.comment.findOne({ _id: dto.commentId });

    if (!comment) return 'Видео не найдено';

    const setting = await this.setting.findOne({
      userId: String(comment.userId),
    });

    if (comment.likes.some((obj) => obj === userId)) {
      comment.likes = comment.likes.filter((obj) => obj !== userId);
      await comment.save();
      return comment;
    }

    comment.likes.push(userId);

    if (setting?.websiteNotification && setting?.likeNotification) {
      await this.notification.createNotification(
        {
          text: `${user?.username} liked this ${comment.text} comment`,
        },
        String(comment.userId),
      );
    }

    await comment.save();

    return comment;
  }
}
