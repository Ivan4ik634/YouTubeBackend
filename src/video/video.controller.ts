import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { QueryFindAll } from 'src/common/dto/queryFindAll';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateVideoDto, createVideoInPlaylistDto, LikeVideo, UpdateVideo } from './dto/video';
import { VideoService } from './video.service';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get()
  async findAll(@Query() query) {
    return this.videoService.findAll(query);
  }
  @Get('recomendations')
  async recomendationsVideo() {
    return this.videoService.recomendationsVideo();
  }
  @Get('likes')
  @UseGuards(AuthGuard)
  async findLikesVideo(@Query() query: QueryFindAll, @CurrectUser() userId: string) {
    return this.videoService.findLikesVideo(query, userId);
  }
  @Get('/profile')
  @UseGuards(AuthGuard)
  async findVideoByProfile(@Query() query: QueryFindAll, @CurrectUser() userId: string) {
    return this.videoService.findVideoByProfile(query, userId);
  }
  @Get('/profile/:userName')
  async findVideoByUserProfile(@Query() query: QueryFindAll, @Param() param: { userName: string }) {
    return this.videoService.findVideoByUserProfile(query, param);
  }
  @Get(':id')
  async findOne(@Param() param: { id: string }, @Body() body: { bearer: string }) {
    return this.videoService.findOne(param.id, body.bearer);
  }
  @Post('pay')
  @UseGuards(AuthGuard)
  async payVideo(@Body() body: { videoId: string }, @CurrectUser() userId: string) {
    return this.videoService.payVideo(body, userId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createVideo(@Body() Body: CreateVideoDto, @CurrectUser() userId: string) {
    return this.videoService.createVideo(Body, userId);
  }
  @Patch()
  @UseGuards(AuthGuard)
  async updateVideo(@Body() Body: UpdateVideo, @CurrectUser() userId: string) {
    return this.videoService.updateVideo(Body, userId);
  }
  @Delete()
  @UseGuards(AuthGuard)
  async deleteVideo(@Body() Body: { videoId: string }, @CurrectUser() userId: string) {
    return this.videoService.deleteVideo(Body, userId);
  }
  @Post('like')
  @UseGuards(AuthGuard)
  async likeVideo(@Body() Body: LikeVideo, @CurrectUser() userId: string) {
    return this.videoService.likeVideo(Body, userId);
  }

  @Post('report')
  @UseGuards(AuthGuard)
  async reportVideo(@Body() body: { category: string; videoId: string }, @CurrectUser() userId: string) {
    return this.videoService.reportVideo(body, userId);
  }
  @Post('hidden')
  @UseGuards(AuthGuard)
  async hiddenVideo(@Body() Body: { id: string }, @CurrectUser() userId: string) {
    return this.videoService.hiddenVideo(Body.id, userId);
  }
  @Post('block')
  @UseGuards(AuthGuard)
  async blockVideo(@Body() Body: { videoId: string }) {
    await this.videoService.blockVideo(Body.videoId);
  }

  @Post('playlist')
  @UseGuards(AuthGuard)
  async createVideoInPlaylist(@Body() dto: createVideoInPlaylistDto) {
    return this.videoService.createVideoInPlaylist(dto);
  }
}
