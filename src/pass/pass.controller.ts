import { Body, Controller, Post } from '@nestjs/common';
import { PassService } from './pass.service';
import { VerifyPass } from 'src/pass/dto/password';

@Controller('pass')
export class PassController {
  constructor(private readonly passService: PassService) {}
  @Post('/reset')
  async passReset(@Body() body: { email: string }) {
    console.log(body);
    return this.passService.resetPass(body.email);
  }

  @Post('/verify')
  async verifyReset(@Body() body: VerifyPass) {
    return this.passService.verefyPass(body);
  }
}
