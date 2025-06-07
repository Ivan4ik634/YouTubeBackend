import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { QueryFindAll } from 'src/common/dto/queryFindAll';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Get()
  @UseGuards(AuthGuard)
  findAll(@Query() query: QueryFindAll, @CurrectUser() userId: string) {
    return this.notificationService.findAll(query, userId);
  }
  @Post()
  @UseGuards(AuthGuard)
  readNotification(@CurrectUser() userId: string) {
    return this.notificationService.readNotification(userId);
  }
  @Delete()
  @UseGuards(AuthGuard)
  deleteAll(@CurrectUser() userId: string) {
    return this.notificationService.deleteAll(userId);
  }
  @Delete(':id')
  @UseGuards(AuthGuard)
  deleteOne(@Param() param: { id: string }, @CurrectUser() userId: string) {
    return this.notificationService.deleteOne(param.id, userId);
  }
}
