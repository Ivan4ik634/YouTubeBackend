import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { EditPlayList, PlayListDto } from './dto/PlayList';
import { QueryFindAll } from 'src/common/dto/queryFindAll';

@Controller('playList')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Query() query: { search: string },
    @CurrectUser() userId: string,
  ) {
    return this.playlistService.findAll(query, userId);
  }
  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Query() query: QueryFindAll,
    @Param() param: { id: string },
    @CurrectUser() userId: string,
  ) {
    return this.playlistService.findOne(query, param.id, userId);
  }
  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateOne(
    @Body() body: EditPlayList,
    @Param() param: { id: string },
    @CurrectUser() userId: string,
  ) {
    return this.playlistService.updateOne(body, param.id, userId);
  }
  @Delete()
  @UseGuards(AuthGuard)
  async deleteAll(@CurrectUser() userId: string) {
    return this.playlistService.deleteAll(userId);
  }
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteOne(@Param('id') id: string, @CurrectUser() userId: string) {
    return this.playlistService.deleteOne(id, userId);
  }
  @Post('')
  @UseGuards(AuthGuard)
  async createPlayList(
    @Body() dto: PlayListDto,
    @CurrectUser() userId: string,
  ) {
    return this.playlistService.createPlaylist(dto, userId);
  }
}
