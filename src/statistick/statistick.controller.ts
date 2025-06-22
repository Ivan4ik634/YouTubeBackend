import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { StatistickService } from './statistick.service';

@Controller('statistick')
export class StatistickController {
  constructor(private readonly statistickService: StatistickService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  async getStatistickVideo(@Param() param: { videoId: string }) {
    return this.statistickService.getStatistickVideo(param.videoId);
  }
}
