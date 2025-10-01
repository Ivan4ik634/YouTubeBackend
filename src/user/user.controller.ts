import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { QueryFindAll } from 'src/common/dto/queryFindAll';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { editProfileDto, LoginDto, RegisterDto } from './dto/user';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('/register')
  async register(@Body() dto: RegisterDto) {
    return this.userService.register(dto);
  }

  @Post('/login')
  async login(@Body() dto: LoginDto) {
    return this.userService.login(dto);
  }

  @Get('/profile')
  @UseGuards(AuthGuard)
  async profile(@CurrectUser() userId: string) {
    return this.userService.profile(userId);
  }
  @Post('/profile')
  @UseGuards(AuthGuard)
  async editProfile(@CurrectUser() userId: string, @Body() dto: editProfileDto) {
    return this.userService.editProfile(userId, dto);
  }
  @Get('/profile/:username')
  async UserProfile(@Param() param: { username: string }) {
    return this.userService.profileUserName(param.username);
  }
  @Post('/subscribe')
  @UseGuards(AuthGuard)
  async addSubscribe(@CurrectUser() userId: string, @Body() body: { user: string }) {
    return this.userService.subscribeProfile(userId, body.user);
  }
  @Post('/block')
  @UseGuards(AuthGuard)
  async blockUser(@CurrectUser() userId: string, @Body() body: { user: string }) {
    return this.userService.blockUser(userId, body.user);
  }
  @Get('/video/likes')
  @UseGuards(AuthGuard)
  async videoLikes(@Query() query: QueryFindAll, @CurrectUser() userId: string) {
    return this.userService.videoLikes(query, userId);
  }
}
