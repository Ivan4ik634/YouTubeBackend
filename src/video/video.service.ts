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
          return obj.userId.hidden === false || obj.userId.isVisibilityVideo === 'all' || obj.isBlocked === false;
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
      .find({ userId, likes: user._id })
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
    await this.pushNotification.sendPushNotification('Тест сообщения!', 'тест сообщения');
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
      .populate<{ userId: User }>('userId');
    console.log(videos);
    return videos.length !== 0
      ? videos.filter((obj) => {
          return obj.userId.hidden === false || obj.userId.isVisibilityVideo === 'all' || obj.isBlocked === false;
        })
      : [];
  }

  async findOne(id: string, bearer: string) {
    const video = await this.video.findOne({ _id: id }).populate<{ userId: User & { _id: string } }>('userId');
    const userId = bearer ? await this.jwt.verify(bearer, { secret: 'secret' }) : '';
    const isVideoUser = userId === video?.userId._id.toString();

    if (!video) return 'Video not found';
    if (video.userId.hidden && !isVideoUser) return 'Video not found';
    if (video.isHidden && !isVideoUser) return 'Video not found';
    if (video?.userId.isVisibilityVideo === 'noting' && !isVideoUser) return 'Video not found';
    if (video.isBlocked === true) return 'Video not found';

    if (bearer) {
      const userId = await this.jwt.verify(bearer, { secret: 'secret' });

      const historyVideo = await this.historyVideo.findOne({
        userId: userId,
        videoId: id,
      });
      if (!historyVideo) {
        if (userId) await this.historyVideo.create({ userId: userId, videoId: id });
      }
    }

    await this.video.updateOne({ _id: id }, { $inc: { views: 1 } });
    await this.statistick.editStatistickVideo(String(video._id), 0, 1, 0);
    await video.save();

    return video;
  }
  async createVideo(dto: CreateVideoDto, userId: string) {
    const video = await this.video.create({ ...dto, userId: userId });
    await video.save();

    const userUpdate = await this.user.findOne({ _id: userId });

    if (!userUpdate) return 'Пользователь не найден';

    userUpdate.videos = userUpdate.videos + 1;

    await userUpdate.save();
    await this.statistick.createStatistickVideo(String(video._id));

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
    console.log(videos);
    return videos.length !== 0
      ? videos.filter((obj) => {
          return obj.userId.hidden === false || obj.userId.isVisibilityVideo === 'all' || obj.isBlocked === false;
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
    const video = await this.video.findOne({ _id: data.videoId });

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
        video.isBlocked = true;
        await video.save();
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса:', error);
    }
  }
}
