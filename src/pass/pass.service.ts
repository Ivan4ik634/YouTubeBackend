import { Injectable } from '@nestjs/common';
import { VerifyPass } from './dto/password';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemes/User.schema';
import { Model } from 'mongoose';
import { Code } from 'src/schemes/Code.schema';
import { generateCode } from 'src/common/func/generatedCode';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class PassService {
  constructor(
    @InjectModel(User.name) private user: Model<User>,
    @InjectModel(Code.name) private code: Model<Code>,
    private readonly email: EmailService,
  ) {}
  async resetPass(email: string) {
    const user = await this.user.findOne({ email: email });
    if (!user) return 'Такого пользователя не существует';
    const code = generateCode();
    await this.code.create({ userId: user._id, code: code });
    const textEmail = `Сброс пароля! Для сбросу пароля потрібно ввести код ${code}`;
    await this.email.sendEmail(
      user.email,
      'Сброс пароля',
      textEmail,
      textEmail,
    );
    return 'На емайле появилось письмо проверте !';
  }
  async verefyPass(body: VerifyPass) {
    console.log(body);
    const user = await this.user.findOne({ email: body.email });
    console.log(user);
    if (!user) return;
    const codeUser = await this.code.findOne({ code: body.code });
    console.log(codeUser);
    if (!codeUser) return { message: 'Incorrect code' };
    if (codeUser[0].createdAt.getTime() < Date.now() - 10 * 60 * 1000) {
      await this.code.deleteMany({ user: user._id });
      return { message: 'The code has timed out' };
    }
    if (body.password !== body.refreshPassword)
      return { message: 'Passwords do not match' };

    await this.user.updateOne({ _id: user._id }, { password: body.password });
    await this.code.deleteMany({ user: user._id });
  }
}
