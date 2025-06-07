import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayListSchema } from 'src/schemes/PlayList.schema';
import { JwtService } from '@nestjs/jwt';
import {
  PlayListVideo,
  PlayListVideoSchema,
} from 'src/schemes/PlayListVideo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'PlayList', schema: PlayListSchema }]),
    MongooseModule.forFeature([
      { name: PlayListVideo.name, schema: PlayListVideoSchema },
    ]),
  ],
  controllers: [PlaylistController],
  providers: [PlaylistService, JwtService],
})
export class PlaylistModule {}
