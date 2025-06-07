import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SettingService } from './setting.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { EditSettingNotificationI } from './dto/EditSettingNotificationI';

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}
  @Get('/notification')
  @UseGuards(AuthGuard)
  async settingNotification(@CurrectUser() userId: string) {
    return this.settingService.settingNotification(userId);
  }
  @Post('/notification')
  @UseGuards(AuthGuard)
  async EditSettingNotification(
    @CurrectUser() userId: string,
    @Body() body: EditSettingNotificationI,
  ) {
    console.log(body);
    return this.settingService.EditSettingNotification(userId, body);
  }
}
