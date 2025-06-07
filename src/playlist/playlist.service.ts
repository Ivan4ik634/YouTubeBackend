import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlayList } from 'src/schemes/PlayList.schema';
import { EditPlayList, PlayListDto } from './dto/PlayList';
import { PlayListVideo } from 'src/schemes/PlayListVideo.schema';
import { QueryFindAll } from 'src/common/dto/queryFindAll';

@Injectable()
export class PlaylistService {
  constructor(@InjectModel(PlayList.name) private playList: Model<PlayList>) {}
  async findAll(query: { search: string }, userId: string) {
    const playlists = await this.playList.find({ userId: userId });
    console.log(playlists);
    return playlists;
  }
  async findOne(query: QueryFindAll, id: string, userId: string) {
    const playlist = await this.playList.findById(id).populate({
      path: 'videosIds',
      populate: {
        path: 'userId',
      },
    });
    if (!playlist) return 'Not found playlist';
    return playlist;
  }
  async updateOne(body: EditPlayList, id: string, userId: string) {
    const playList = await this.playList.findOne({ _id: id });
    if (!playList) return 'Not found playlist';
    if (userId !== String(playList.userId))
      return 'Error userId is not the same as playlist';
    return this.playList.updateOne({ _id: id }, { body });
  }
  async deleteAll(userId: string) {
    return this.playList.deleteMany({ userId: userId });
  }
  async deleteOne(id: string, userId: string) {
    return this.playList.deleteOne({ _id: id, userId: userId });
  }
  async createPlaylist(dto: PlayListDto, userId: string) {
    const playlist = await this.playList.create({
      title: dto.title,
      preview: dto.preview,
      userId: userId,
    });
    return playlist;
  }
}
