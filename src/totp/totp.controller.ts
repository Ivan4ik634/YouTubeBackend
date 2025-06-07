import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TotpService } from './totp.service';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('totp')
export class TotpController {
  constructor(private readonly totpService: TotpService) {}
  @Get('/generate')
  @UseGuards(AuthGuard)
  generate(@CurrectUser() userId: string) {
    return this.totpService.generateSecret(userId);
  }

  @Post('/enable')
  @UseGuards(AuthGuard)
  enable(@CurrectUser() userId: string, @Body() body: {token:string}) {
    console.log(body)
    return this.totpService.enable2FA(userId, body.token);
  }

  @Post('/disable')
  @UseGuards(AuthGuard)
  disable(@CurrectUser() userId: string) {
    return this.totpService.disable2FA(userId);
  }
}
