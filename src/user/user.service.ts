import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcryptjs from 'bcryptjs';
import { Model, Types } from 'mongoose';
import { QueryFindAll } from 'src/common/dto/queryFindAll';
import { EmailService } from 'src/email/email.service';
import { NotificationService } from 'src/notification/notification.service';
import { Setting } from 'src/schemes/Setting.schema';
import { User } from 'src/schemes/User.schema';
import { Video } from 'src/schemes/Video.schema';
import { TotpService } from 'src/totp/totp.service';
import { editProfileDto, LoginDto, RegisterDto } from './dto/user';
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
    const user = await this.user.findOne({
      username: dto.username,
    });
    const userEmail = await this.user.findOne({
      email: dto.email,
    });
    if (user || userEmail)
      return {
        message: 'A user with this name or email already exists',
      };

    const salt = await bcryptjs.genSalt(10);
    const hashed = await bcryptjs.hash(dto.password, salt);
    const newUser = await this.user.create({ ...dto, playerIds: dto.playerId, password: hashed });
    await this.setting.create({ userId: String(newUser._id) });
    const emailVerifyToken = await this.jwt.signAsync({ _id: newUser._id }, { secret: 'secret', expiresIn: '1h' });
    const link = `<a href=https://white-youtube.vercel.app/verify?token=${emailVerifyToken}>Will confirm mail</a>`;
    const textEmail = `Thank you for registering! To activate your account, confirm your email using this link ${link}`;
    await this.email.sendEmail(newUser.email, 'Mail confirmation', textEmail, textEmail);

    return { message: 'A letter has appeared in the mail, check it!' };
  }
  async login(dto: LoginDto) {
    const userEmail = await this.user.findOne({ email: dto.username });
    const userUserName = await this.user.findOne({ username: dto.username });

    if (!userEmail && userUserName) {
      const isValidPassword = await bcryptjs.compare(dto.password, userUserName.password);
      if (isValidPassword) {
        if (userUserName.isEnabledTotp) {
          if (!dto.code) return { message: 'You need to pass 2FA verification via TOTP' };
          if ((await this.totp.verify2FA(String(userUserName._id), dto.code)) === false)
            return { message: 'Invalid TOTP code' };
        }

        const emailVerifyToken = await this.jwt.signAsync(
          { _id: userUserName._id },
          { secret: 'secret', expiresIn: '1h' },
        );
        const link = `<a href=https://white-youtube.vercel.app/verify?token=${emailVerifyToken}>Will confirm mail</a>`;
        const textEmail = `Thank you for returning to our platform! To activate your account, confirm your email using this link ${link}`;
        await this.email.sendEmail(userUserName.email, 'Mail confirmation', textEmail, textEmail);
        const userPlayerId = await this.user.findOne({ _id: userUserName._id, playerIds: dto.playerId });
        if (!userPlayerId) {
          await this.user.updateOne(
            {
              _id: userUserName._id,
            },
            { $push: { playerIds: dto.playerId } },
          );
        }
        return { message: 'A letter has appeared in the mail, check it!' };
      }
    }
    if (userEmail && !userUserName) {
      const isValidPassword = await bcryptjs.compare(dto.password, userEmail.password);
      if (isValidPassword) {
        if (userEmail.isEnabledTotp) {
          if (!dto.code) return { message: 'You need to pass 2FA verification via TOTP' };
          if ((await this.totp.verify2FA(String(userEmail._id), dto.code)) === false)
            return { message: 'Invalid TOTP code' };
        }

        const emailVerifyToken = await this.jwt.signAsync(
          { _id: userEmail._id },
          { secret: 'secret', expiresIn: '1h' },
        );
        const link = `<a href=https://white-youtube.vercel.app/verify?token=${emailVerifyToken}>Will confirm mail</a>`;
        const textEmail = `Thank you for returning to our platform! To activate your account, confirm your email using this link ${link}`;
        await this.email.sendEmail(userEmail.email, 'Mail confirmation', textEmail, textEmail);
        const userPlayerId = await this.user.findOne({ _id: userEmail._id, playerIds: dto.playerId });
        if (!userPlayerId) {
          await this.user.updateOne(
            {
              _id: userEmail._id,
            },
            { $push: { playerIds: dto.playerId } },
          );
        }
        return { message: 'A letter has appeared in the mail, check it!' };
      }
    }

    return { message: 'Incorrect login or password' };
  }

  async verifyEmail(token: string) {
    const user = await this.jwt.verify(token, { secret: 'secret' });
    const userVerify = await this.user.findById(user._id);
    if (!userVerify) return { message: 'Такого пользователя не существует' };
    const refreshToken = await this.jwt.signAsync({ _id: user._id }, { secret: 'secret', expiresIn: '30d' });
    const accetsToken = await this.jwt.signAsync({ _id: user._id }, { secret: 'secret', expiresIn: '1h' });
    return { refreshToken, accetsToken };
  }

  async editProfile(userId: string, dto: editProfileDto) {
    console.log(dto);
    const userUserName = await this.user.findOne({ username: dto.username });
    const userEmail = await this.user.findOne({ email: dto.email });
    if (userUserName && userEmail) return { message: 'Такое имя пользователя уже существует' };
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

    const isSubscribed = user.subscribers.some((id) => (id.equals ? id.equals(userId) : String(id) === String(userId)));

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
        await this.notification.createNotification({ text: `Subscribed to you ${user.username}` }, dto);
      }
      await user.save();
      console.log('Подписались. Подписчики после:', user.subscribers);
      return 'Вы подписались';
    }
  }
  async videoLikes(query: QueryFindAll, userId: string) {
    const skip = query.limit * (query.page - 1);
    const videoLikes = await this.video.find({ likes: userId }).limit(query.limit).skip(skip).populate('userId');
    return videoLikes;
  }
  async blockUser(userId: string, dto: string) {
    console.log(dto);
    const user = await this.user.findOne({ _id: dto });
    const userMe = await this.user.findOne({ _id: userId });
    if (!user) return 'Такого пользователя не существует';
    if (!userMe) return 'Такого пользователя не существует';
    const isBlock = await this.user.findOne({
      _id: userId,
      blocedUsers: { $in: user._id },
    });
    if (isBlock) {
      userMe.blocedUsers = userMe.blocedUsers.filter((id) =>
        id.equals ? !id.equals(String(user._id)) : String(id) !== String(user._id),
      );
      await userMe.save();
      return 'Вы разблокировали пользователя';
    } else {
      userMe.blocedUsers.push(user._id);
      await userMe.save();
      return 'Вы заблокировали пользователя';
    }
  }
}
