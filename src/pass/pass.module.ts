import { Module } from '@nestjs/common';
import { PassService } from './pass.service';
import { PassController } from './pass.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CodeSchema } from 'src/schemes/Code.schema';
import { UserSchema } from 'src/schemes/User.schema';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Code', schema: CodeSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    EmailModule,
  ],
  controllers: [PassController],
  providers: [PassService],
})
export class PassModule {}
