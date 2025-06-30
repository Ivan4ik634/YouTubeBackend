import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { StatistickService } from './statistick.service';

@Controller('statistick')
export class StatistickController {
  constructor(private readonly statistickService: StatistickService) {}

  @Post()
  @UseGuards(AuthGuard)
  async getStatistickVideo(@CurrectUser() userId: string, @Body() body: { id: string }) {
    return this.statistickService.getStatistickVideo(userId, body.id);
  }
  @Post()
  @UseGuards(AuthGuard)
  async getStatistickWallet(@CurrectUser() userId: string) {
    return this.statistickService.getStatistickWallet(userId);
  }
}
