import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import { QueryFindAll } from 'src/common/dto/queryFindAll';
import { NotificationService } from 'src/notification/notification.service';
import { HistoryVideo } from 'src/schemes/HistoryVideo.schema';
import { PlayList } from 'src/schemes/PlayList.schema';
import { Setting } from 'src/schemes/Setting.schema';
import { User } from 'src/schemes/User.schema';
import { Video } from 'src/schemes/Video.schema';

import { StatistickService } from 'src/statistick/statistick.service';
import { CreateVideoDto, LikeVideo, UpdateVideo, createVideoInPlaylistDto } from './dto/video';

import { Mistral } from '@mistralai/mistralai';
import { UserDto } from 'src/common/dto/user.dto';
import { PaymentService } from 'src/payment/payment.service';
import { PushNotificationService } from 'src/push-notification/push-notification.service';
import { Report } from 'src/schemes/Report.schema';
import { ResponseMistralRepostT } from './dto/ResponseMistralRepost';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name) private video: Model<Video>,
    @InjectModel(HistoryVideo.name) private historyVideo: Model<HistoryVideo>,
    @InjectModel(Setting.name) private setting: Model<Setting>,
    @InjectModel(PlayList.name) private playList: Model<PlayList>,
    @InjectModel(User.name) private user: Model<User>,
    @InjectModel(Report.name) private report: Model<Report>,

    private readonly statistick: StatistickService,
    private readonly notification: NotificationService,
    private readonly jwt: JwtService,
    private readonly pushNotification: PushNotificationService,
    private readonly payment: PaymentService,
  ) {}

  async findVideoByUserProfile(query: QueryFindAll, param: { userName: string }) {
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const user = await this.user.findOne({ username: param.userName });
    if (!user) return 'Такого юзера не має!';
    const videos = (await this.video
      .find({ isHidden: false, userId: String(user._id) })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('userId')) as any;
    console.log(videos);
    return videos.length !== 0
      ? videos.filter((obj) => {
          return !obj.userId.hidden && obj.userId.isVisibilityVideo === 'public' && !obj.isBlocked;
        })
      : [];
  }
  async findLikesVideo(query: QueryFindAll, userId: string) {
    const user = await this.user.findOne({ _id: userId });
    console.log(user);
    if (!user) return 'This user is not defined!';
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const videos = (await this.video
      .find({ likes: [user._id] })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('userId')) as any;
    console.log(videos);
    return videos.length !== 0 ? videos : [];
  }
  async findVideoByProfile(query: QueryFindAll, userId: string) {
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const videos = (await this.video
      .find({ userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('userId')) as any;
    return videos.length !== 0 ? videos : [];
  }
  async findAll(query: QueryFindAll) {
    const limit = Number(query.limit) || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const search = query.search || '';

    const videos = await this.video
      .find({
        isHidden: false,
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ],
      })
      .skip(skip)
      .limit(limit)
      .select('-video') // ⬅️ исключаем поле video
      .populate<{ userId: User }>('userId');

    return videos.length !== 0
      ? videos.filter((obj) => {
          return !obj.userId.hidden && obj.userId.isVisibilityVideo === 'public' && !obj.isBlocked;
        })
      : [];
  }

  async findOne(id: string, bearer: string) {
    const video = await this.video.findOne({ _id: id }).populate<{ userId: User & { _id: string } }>('userId');
    const payload: { _id: string } = bearer ? await this.jwt.verify(bearer, { secret: 'secret' }) : { _id: '' };
    const isAutor = payload._id === video?.userId._id.toString();
    if (!video) return 'Video not found';
    if (bearer) {
      const historyVideo = await this.historyVideo.findOne({
        userId: payload._id,
        videoId: id,
      });
      if (!historyVideo) {
        if (payload) await this.historyVideo.create({ userId: payload._id, videoId: id });
      }
    }
    await this.video.updateOne({ _id: id }, { $inc: { views: 1 } });
    await this.statistick.editStatistickVideo(String(video._id), 0, 1, 0);
    await video.save();

    if (isAutor) return video;
    if (
      video.userId.hidden ||
      video.isHidden ||
      video?.userId.isVisibilityVideo === 'private' ||
      video.isBlocked === true
    )
      return 'Video not found';
    if (video.price > 0 && !video.purchasedBy.some((obj) => obj.toString() === payload._id))
      return { purchasedBy: video.purchasedBy, videoId: video._id, userId: video.userId, price: video.price };

    return video;
  }
  async createVideo(dto: CreateVideoDto, userId: string) {
    const video = await this.video.create({ ...dto, userId: userId });
    await video.save();

    const userUpdate = await this.user.findOne({ _id: userId }).populate<{ subscribers: UserDto[] }>('subscribers');

    if (!userUpdate) return 'Пользователь не найден';

    userUpdate.videos = userUpdate.videos + 1;

    await userUpdate.save();
    await this.statistick.createStatistickVideo(String(video._id));
    const res = await this.pushNotification.sendPushNotification(
      userUpdate.subscribers.map((obj) => obj.playerIds).flat(),
      `A new video has appeared on ${userUpdate.username}`,
      `Watch now video 🔥`,
      `https://white-youtube.vercel.app/profile/${userUpdate.username}`,
      `${video.preview}`,
    );
    console.log(res);
    return video;
  }
  async deleteVideo(dto: { videoId: string }, userId: string) {
    const video = await this.video.findOne({ _id: dto.videoId });

    if (!video) return 'Video not found';
    if (String(video.userId) !== userId) return 'Вы не можете удалить этот видео';

    await this.historyVideo.deleteMany({ videoId: dto.videoId });
    await this.video.deleteOne({ _id: dto.videoId });
    await this.statistick.deleteStatistickVideo(dto.videoId);

    const userUpdate = await this.user.findOne({ _id: userId });

    if (!userUpdate) return 'Пользователь не найден';

    userUpdate.videos = userUpdate.videos - 1;

    return { message: 'Video Delete' };
  }

  async recomendationsVideo() {
    const videos = await this.video
      .find({
        isHidden: false,
      })
      .sort({
        views: -1,
        createdAt: -1,
        likesCount: -1,
        commentsCount: -1,
      })
      .limit(5)
      .populate<{ userId: User }>('userId');
    return videos.length !== 0
      ? videos.filter((obj) => {
          return !obj.userId.hidden && obj.userId.isVisibilityVideo === 'public' && !obj.isBlocked;
        })
      : [];
  }
  async updateVideo(dto: UpdateVideo, userId: string) {
    const video = await this.video.findOne({ _id: dto.videoId });

    if (!video) return 'Video not found';
    if (String(video.userId) !== userId) return 'You can`t update this video';

    await this.video.updateOne({ _id: dto.videoId }, { ...dto });
    await video.save();

    return video;
  }
  async likeVideo(dto: LikeVideo, userId: string) {
    const user = await this.user.findOne({ _id: userId });
    const video = await this.video.findOne({ _id: dto.videoId });
    if (!video) return 'Video not found';
    if (String(video.likes).includes(userId)) {
      video.likes = video.likes.filter((id) => String(id) !== userId);
      video.likesCount = video.likesCount - 1;

      await this.statistick.editStatistickVideo(String(video._id), -1, 0, 0);

      await video.save();
      return video;
    }
    video.likes.push(new Types.ObjectId(userId));
    video.likesCount = video.likesCount + 1;

    await this.statistick.editStatistickVideo(String(video._id), 1, 0, 0);

    const setting = await this.setting.findOne({
      userId: String(video.userId),
    });

    if (setting?.websiteNotification && setting?.likeNotification) {
      await this.notification.createNotification(
        {
          text: `${user?.username} liked this ${video.title} video`,
        },
        String(video.userId),
      );
    }

    await video.save();
    return video;
  }
  async createVideoInPlaylist(dto: createVideoInPlaylistDto) {
    const video = await this.video.findOne({ _id: dto.videoId });
    const playlist = await this.playList.findOne({ _id: dto.playlistId });

    if (!video) return 'Video not found';
    if (!playlist) return 'Playlist not found';

    if (playlist.videosIds.some((item) => String(item) === String(video._id))) {
      playlist.videosIds = playlist.videosIds.filter((id) => String(id) !== String(video._id));
      await playlist.save();
      return 'Video save in playList';
    } else {
      playlist.videosIds.push(new Types.ObjectId(video._id));
      await playlist.save();
      return 'Video delete in playlist';
    }
  }
  async hiddenVideo(videoId: string, userId: string) {
    const user = await this.user.findOne({ _id: userId });
    const video = await this.video.findOne({ _id: videoId });
    if (!video) return 'Video not found';
    if (!user) return 'User not found';
    if (String(video.userId) !== userId) return 'You no can hidden this video';
    video.isHidden = !video.isHidden;
    user.videos = video.isHidden ? user.videos - 1 : user.videos + 1;
    await this.video.updateOne({ _id: video._id }, { isHidden: !video.isHidden });
    await this.user.updateOne({ _id: user._id }, { $inc: { videos: video.isHidden ? -1 : 1 } });
    await video.save();
    await user.save();
    return `You video ${video.isHidden ? 'hidden' : 'unhidden'}!`;
  }
  async blockVideo(videoId: string) {
    const video = await this.video.findOne({ _id: videoId });
    if (!video) return 'Video not found';
    video.isBlocked = !video.isBlocked;
    await video.save();
    return video;
  }

  async reportVideo(data: { category: string; videoId: string }, userId: string) {
    const video = await this.video.findOne({ _id: data.videoId }).populate<{ userId: UserDto }>('userId');

    console.log(video);
    if (!video) return 'video not found';

    const reportExists = await this.report.findOne({ userId: userId });
    if (reportExists) return 'There is already a report from you!';

    const newReport = await this.report.create({ videoId: data.videoId, userId: userId, category: data.category });
    await this.video.updateOne({ _id: video._id }, { $push: { reports: newReport._id } });
    const reportsDB = await this.report.find({ videoId: String(video._id) });

    const reports: { videoId: string; category: { id: string; users: string[] } }[] = [];

    for (let i = 0; i <= reportsDB.length - 1; i++) {
      if (reports.some((obj) => obj.category.id === reportsDB[i].category)) {
        reports
          .find((obj) => obj.category.id === reportsDB[i].category)
          ?.category.users.push(String(reportsDB[i].userId));
      } else {
        reports.push({
          videoId: String(video._id),
          category: { id: reportsDB[i].category, users: [String(reportsDB[i].userId)] },
        });
      }
    }
    console.log(reports);

    const users = await this.user.find();

    const text = `
    
    Видео на модерацию:
- Название: "${video.title}"
- Описание: "${video.description || 'нет описания'}"
- Жалоб: ${reportsDB.length} из ${users.length} пользователей (${Math.round((reportsDB.length / users.length) * 100)}%)
- Категория жалоб: ${reports.map((item) => `${item.category.id}: ${item.category.users.length}`).join(', ')}
- Коментов: ${video.commentsCount}
- Превью: ${video.preview}
- Просмотров: ${video.views || 0}
- Лайков: ${video.likesCount || 0} 👍
- Дата загрузки: ${video.createdAt}
- Теги: ${video.tags?.join(', ') || 'нет тегов'}

Рекомендация (ответь строго JSON):
{
  "should_ban": boolean,
  "reason": string,
  "confidence": number (0-1),
  "suggested_action": "full_ban"|"age_restrict"|"demonetize"|"warning"|"no_action"
}
  `;

    console.log(text);
    const apiKey = '2fe0qXmgfCCxS3X7NzzMfKYfaBqIJgFo';
    try {
      const client = new Mistral({ apiKey: apiKey });

      const chatResponse = await client.chat.complete({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: text }],
      });

      const pureJsonString = chatResponse.choices[0].message.content
        ?.toString()!
        .replace(/^```json\s*/, '') // Удаляем начало
        .replace(/\s*```$/, ''); // Удаляем конец
      const mistarlResponse: ResponseMistralRepostT = JSON.parse(pureJsonString!);
      console.log(mistarlResponse);
      if (mistarlResponse.should_ban) {
        await this.pushNotification.sendPushNotification(
          video.userId.playerIds,
          `Your video has been blocked.`,
          `Video name : ${video.title}`,
          `https://white-youtube.vercel.app/studio`,
        );

        video.isBlocked = true;
        await video.save();
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса:', error);
    }
  }
  async payVideo(body: { videoId: string; transferId: string }, userId: string) {
    const video = await this.video.findOne({ _id: body.videoId }).populate<{ userId: UserDto }>('userId');
    if (!video) return 'video not found';
    if (video.purchasedBy.some((obj) => String(obj) === userId)) {
      return 'The video has already been paid for, please reload the page';
    }
    await this.payment.moneyTransfer(
      { amount: video.price, transferId: body.transferId, userTransfer: video.userId.username },
      userId,
    );

    await this.video.updateOne({ _id: body.videoId }, { $push: { purchasedBy: userId } });
    await this.pushNotification.sendPushNotification(
      video.userId.playerIds,
      `Your video has been paid for`,
      `Video name : ${video.title} , price: ${video.price}MN `,
      `https://white-youtube.vercel.app/wallet`,
    );
    return 'Video payment!';
  }
}
