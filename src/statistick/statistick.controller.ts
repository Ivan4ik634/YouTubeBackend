import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { StatistickService } from './statistick.service';

@Controller('statistick')
export class StatistickController {
  constructor(private readonly statistickService: StatistickService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  async getStatistickVideo(@CurrectUser() userId: string, @Param() param: { id: string }) {
    return this.statistickService.getStatistickVideo(userId, param.id);
  }
}
