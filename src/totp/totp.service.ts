import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemes/User.schema';

import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { createEncryptor } from 'simple-encryptor';

@Injectable()
export class TotpService {
  secret = '912939qiwieiiqutuquasjdjaj1123';
  myEncryptor = createEncryptor(this.secret);
  constructor(@InjectModel(User.name) private user: Model<User>) {}

  async generateSecret(userId: string) {
    const user = await this.user.findById(userId);
    if (!user) return 'У вас немає профілю!';
    const secret = speakeasy.generateSecret({
      name: `White YouTube | ${user.username}`,
    });

    await this.user.findByIdAndUpdate(userId, {
      codeTotp: this.myEncryptor.encrypt(secret.base32),
      isEnabledTotp: false,
    });
    const qrCode = await qrcode.toDataURL(secret.otpauth_url!);

    return {
      otpauth_url: secret.otpauth_url,
      base32: secret.base32,
      qrCode,
    };
  }
  async verify2FA(userId: string, token: string) {
    const userData = await this.user.findById(userId);
    if (!userData || !userData.isEnabledTotp) {
      throw new Error('2FA not enabled');
    }

    const verified = speakeasy.totp.verify({
      secret: this.myEncryptor.decrypt(userData.codeTotp),
      encoding: 'base32',
      token,
    });
    return verified;
  }

  async enable2FA(userId: string, token: string) {
    const userData = await this.user.findById(userId);
    if (!userData) throw new Error('Secret not generated');

    const verified = speakeasy.totp.verify({
      secret: this.myEncryptor.decrypt(userData.codeTotp),

      encoding: 'base32',
      token,
    });

    if (verified) {
      userData.isEnabledTotp = true;
    }
    await userData.save();
    return verified;
  }

  async disable2FA(userId: string) {
    const user = await this.user.findById(userId);
    if (user) {
      user.isEnabledTotp = false;
      await user.save();
    }
    return true;
  }
}
