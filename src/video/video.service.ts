import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import { Video } from 'src/schemes/Video.schema';
import { HistoryVideo } from 'src/schemes/HistoryVideo.schema';
import { QueryFindAll } from 'src/common/dto/queryFindAll';
import { PlayList } from 'src/schemes/PlayList.schema';
import { NotificationService } from 'src/notification/notification.service';
import { User } from 'src/schemes/User.schema';
import { Setting } from 'src/schemes/Setting.schema';

import {
  CreateVideoDto,
  UpdateVideo,
  LikeVideo,
  createVideoInPlaylistDto,
} from './dto/video';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name) private video: Model<Video>,
    @InjectModel(HistoryVideo.name) private historyVideo: Model<HistoryVideo>,
    @InjectModel(Setting.name) private setting: Model<Setting>,
    @InjectModel(PlayList.name) private playList: Model<PlayList>,
    @InjectModel(User.name) private user: Model<User>,

    private readonly notification: NotificationService,
    private readonly jwt: JwtService,
  ) {}

  async findByProfile(query: QueryFindAll, param: { userName: string }) {
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

    return videos.filter((obj) => {
      return (
        obj.userId.hidden === false || obj.userId.isVisibilityVideo === 'all'
      );
    });
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
      .populate<{ userId: User }>('userId');

    return videos.length > 0
      ? videos.filter((obj) => {
          return (
            obj.userId.hidden === false ||
            obj.userId.isVisibilityVideo === 'all'
          );
        })
      : [];
  }

  async findOne(id: string, bearer: string) {
    const video = await this.video
      .findOne({ _id: id })
      .populate<{ userId: User }>('userId');
    const userId = await this.jwt.verify(bearer, { secret: 'secret' });
    const isVideoUser = userId === video?.userId.toString();
    if (!video) return 'Video not found';
    if (video.userId.hidden && !isVideoUser) return 'Video not found';
    if (video.isHidden && !isVideoUser) return 'Video not found';
    if (video?.userId.isVisibilityVideo === 'noting' && !isVideoUser)
      return 'Video not found';

    if (bearer) {
      const userId = await this.jwt.verify(bearer, { secret: 'secret' });

      const historyVideo = await this.historyVideo.findOne({
        userId: userId,
        videoId: id,
      });
      if (!historyVideo) {
        if (userId)
          await this.historyVideo.create({ userId: userId, videoId: id });
      }
    }
    await this.video.updateOne({ _id: id }, { $inc: { views: 1 } });
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
    return video;
  }
  async deleteVideo(dto: { videoId: string }, userId: string) {
    const video = await this.video.findOne({ _id: dto.videoId });
    if (!video) return 'Video not found';
    if (String(video.userId) !== userId)
      return 'Вы не можете удалить этот видео';

    await this.historyVideo.deleteMany({ videoId: dto.videoId });
    await this.video.deleteOne({ _id: dto.videoId });
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

    return videos.length > 0
      ? videos.filter((obj) => {
          return (
            obj.userId.hidden === false ||
            obj.userId.isVisibilityVideo === 'all'
          );
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
      await video.save();
      return video;
    }
    video.likes.push(new Types.ObjectId(userId));
    video.likesCount = video.likesCount + 1;
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
      playlist.videosIds = playlist.videosIds.filter(
        (id) => String(id) !== String(video._id),
      );
      await playlist.save();
      return 'Video save in playList';
    } else {
      playlist.videosIds.push(new Types.ObjectId(video._id));
      await playlist.save();
      return 'Video delete in playlist';
    }
  }
  async hiddenVideo(videoId: string, userId: string) {
    const video = await this.video.findOne({ _id: videoId });
    if (!video) return 'Video not found';
    if (String(video.userId) !== userId) return 'You no can hidden this video';
    video.isHidden = !video.isHidden;
    await this.video.updateOne(
      { _id: video._id },
      { isHidden: !video.isHidden },
    );
    await video.save();
    return `You video ${video.isHidden ? 'hidden' : 'unhidden'}!`;
  }
  async blockVideo(videoId: string) {
    const video = await this.video.findOne({ _id: videoId });
    if (!video) return 'Video not found';
    video.isBlocked = !video.isBlocked;
    await video.save();
    return video;
  }
}
