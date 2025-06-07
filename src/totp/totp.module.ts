import { Module } from '@nestjs/common';
import { TotpService } from './totp.service';
import { TotpController } from './totp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/schemes/User.schema';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [TotpController],
  providers: [TotpService, JwtService],
  exports: [TotpService],
})
export class TotpModule {}
