import { BadRequestException, Injectable } from '@nestjs/common';
import { editProfileDto, LoginDto, RegisterDto } from './dto/user';
import { User } from 'src/schemes/User.schema';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { EmailService } from 'src/email/email.service';
import { Subscribe } from 'src/schemes/Subscribes.schema';
import { NotificationService } from 'src/notification/notification.service';
import { TotpService } from 'src/totp/totp.service';
import { Video } from 'src/schemes/Video.schema';
import { QueryFindAll } from 'src/common/dto/queryFindAll';
import { Setting } from 'src/schemes/Setting.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private user: Model<User>,
    @InjectModel(Video.name) private video: Model<Video>,
    @InjectModel(Setting.name)
    private setting: Model<Setting>,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
    private readonly notification: NotificationService,
    private readonly totp: TotpService,
  ) {}
  async register(dto: RegisterDto) {
    console.log(dto);
    const user = await this.user.findOne({
      username: dto.username,
    });
    const userEmail = await this.user.findOne({
      email: dto.email,
    });
    if (user || userEmail)
      return {
        message: 'Пользователь с таким именем или почтой уже существует',
      };

    const newUser = await this.user.create(dto);
    await this.setting.create({ userId: String(newUser._id) });
    const emailVerifyToken = await this.jwt.signAsync(
      { _id: newUser._id },
      { secret: 'secret', expiresIn: '1h' },
    );
    const link = `<a href=http://localhost:3000/verify?token=${emailVerifyToken}>Подтвердить почту</a>`;
    const textEmail = `Дякумо за регистрацию! Для активации аккаунта потвердіть свою пошту по цьому посиланню ${link}`;
    await this.email.sendEmail(
      newUser.email,
      'Подтверждение почты',
      textEmail,
      textEmail,
    );

    return { message: 'На емайле появилось письмо проверте !' };
  }
  async login(dto: LoginDto) {
    const userEmail = await this.user.findOne({ email: dto.username });
    const userUserName = await this.user.findOne({ username: dto.username });
    if (!userEmail && userUserName) {
      if (dto.password === userUserName.password) {
        if (userUserName.isEnabledTotp) {
          if (!dto.code)
            return { message: 'Нужно пройти 2FA проверку через TOTP' };
          if (
            (await this.totp.verify2FA(String(userUserName._id), dto.code)) ===
            false
          )
            return { message: 'Неправильный код TOTP' };
        }

        const emailVerifyToken = await this.jwt.signAsync(
          { _id: userUserName._id },
          { secret: 'secret', expiresIn: '1h' },
        );
        const link = `<a href=https://white-youtube.vercel.app/verify?token=${emailVerifyToken}>Подтвердить почту</a>`;
        const textEmail = `Дякумо за повернення до нашої платформи! Для активации аккаунта потвердіть свою пошту по цьому посиланню ${link}`;
        await this.email.sendEmail(
          userUserName.email,
          'Подтверждение почты',
          textEmail,
          textEmail,
        );
        return { message: 'На емайле появилось письмо проверте !' };
      }
    }
    if (userEmail && !userUserName) {
      if (dto.password === userEmail.password) {
        if (userEmail.isEnabledTotp) {
          if (!dto.code)
            return { message: 'Нужно пройти 2FA проверку через TOTP' };
          if (
            (await this.totp.verify2FA(String(userEmail._id), dto.code)) ===
            false
          )
            return { message: 'Неправильный код TOTP' };
        }

        const emailVerifyToken = await this.jwt.signAsync(
          { _id: userEmail._id },
          { secret: 'secret', expiresIn: '1h' },
        );
        const link = `<a href=https://white-youtube.vercel.app/verify?token=${emailVerifyToken}>Подтвердить почту</a>`;
        const textEmail = `Дякумо за повернення до нашої платформи! Для активации аккаунта потвердіть свою пошту по цьому посиланню ${link}`;
        await this.email.sendEmail(
          userEmail.email,
          'Подтверждение почты',
          textEmail,
          textEmail,
        );
        return { message: 'На емайле появилось письмо проверте !' };
      }
    }

    return { message: 'Неправильный логин или пароль' };
  }
  async verifyEmail(token: string) {
    const user = await this.jwt.verify(token, { secret: 'secret' });
    const userVerify = await this.user.findById(user._id);
    if (!userVerify) return { message: 'Такого пользователя не существует' };
    const refreshToken = await this.jwt.signAsync(
      { _id: user._id },
      { secret: 'secret', expiresIn: '30d' },
    );
    const accetsToken = await this.jwt.signAsync(
      { _id: user._id },
      { secret: 'secret', expiresIn: '1h' },
    );
    return { refreshToken, accetsToken };
  }

  async editProfile(userId: string, dto: editProfileDto) {
    console.log(dto);
    const userUserName = await this.user.findOne({ username: dto.username });
    const userEmail = await this.user.findOne({ email: dto.email });
    if (userUserName && userEmail)
      return { message: 'Такое имя пользователя уже существует' };
    const user = await this.user.findById(userId);
    if (!user) return { message: 'Такого пользователя не существует' };
    const data = {
      ...dto,
      email: dto.email === '' ? user.email : dto.email,
      username: dto.username === '' ? user.username : dto.username,
    };
    const userUpdate = await this.user.findByIdAndUpdate(userId, {
      ...data,
    });

    return { userUpdate };
  }

  async profile(userId: string) {
    const profile = await this.user.findById(userId).populate('blocedUsers');
    return profile;
  }
  async profileUserName(userName: string) {
    const profile = await this.user.findOne({ username: userName });
    return profile;
  }
  async subscribeProfile(userId: string, dto: string) {
    const user = await this.user.findOne({ _id: dto });
    const setting = await this.setting.findOne({ userId: dto });
    if (!user) return 'Такого пользователя не существует';

    console.log('Подписчики до:', user.subscribers);

    const isSubscribed = user.subscribers.some((id) =>
      id.equals ? id.equals(userId) : String(id) === String(userId),
    );

    if (isSubscribed) {
      user.subscribers = user.subscribers.filter((id) =>
        id.equals ? !id.equals(userId) : String(id) !== String(userId),
      );
      await user.save();
      console.log('Отписались. Подписчики после:', user.subscribers);
      return 'Вы отписались';
    } else {
      user.subscribers.push(new Types.ObjectId(userId));
      if (setting?.websiteNotification && setting?.subscribeNotification) {
        await this.notification.createNotification(
          { text: `Subscribed to you ${user.username}` },
          dto,
        );
      }
      await user.save();
      console.log('Подписались. Подписчики после:', user.subscribers);
      return 'Вы подписались';
    }
  }
  async videoLikes(query: QueryFindAll, userId: string) {
    const skip = query.limit * (query.page - 1);
    const videoLikes = await this.video
      .find({ likes: userId })
      .limit(query.limit)
      .skip(skip)
      .populate('userId');
    return videoLikes;
  }
  async blockUser(userId: string, dto: string) {
    console.log(dto);
    const user = await this.user.findOne({ _id: dto });
    if (!user) return 'Такого пользователя не существует';
    const isBlock = await this.user.findOne({
      user: userId,
      blocedUsers: { $in: user._id },
    });
    if (isBlock) {
      user.blocedUsers = user.blocedUsers.filter((id) =>
        id.equals ? !id.equals(userId) : String(id) !== String(userId),
      );
      await user.save();
      return 'Вы разблокировали пользователя';
    } else {
      user.blocedUsers.push(new Types.ObjectId(userId));
      await user.save();
      return 'Вы заблокировали пользователя';
    }
  }
}
