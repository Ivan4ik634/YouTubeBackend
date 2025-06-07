import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { QueryFindAll } from 'src/common/dto/queryFindAll';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}
  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Query() query: QueryFindAll, @CurrectUser() userId: string) {
    return this.historyService.findAll(query, userId);
  }
  @Delete()
  @UseGuards(AuthGuard)
  async deleteAll(@CurrectUser() userId: string) {
    return this.historyService.deleteAll(userId);
  }
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteOne(
    @Param() param: { id: string },
    @CurrectUser() userId: string,
  ) {
    return this.historyService.deleteOne(param.id, userId);
  }
}
