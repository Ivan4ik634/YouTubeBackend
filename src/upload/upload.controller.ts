import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/file')
  @UseInterceptors(FileInterceptor('file'))
  async UploadFile(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadFile(file, false);

    return { url };
  }
  @Post('/video')
  @UseInterceptors(FileInterceptor('video'))
  async UploadVideo(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadFile(file, true);

    return { url };
  }
  @Post('/video/chunk')
  @UseInterceptors(FileInterceptor('file'))
  async UploadVideoChunk(
    @UploadedFile() file: Express.Multer.File,
    @Body('index') index: string,
    @Body('isLast') isLast: string,
    @Body('fileName') fileName: string,
  ) {
    try {
      const url = await this.uploadService.uploadChunk(
        file,
        index,
        isLast,
        fileName,
      );
      return { url };
    } catch (error) {
      console.error('Ошибка загрузки чанка:', error);
      // Можно возвращать понятный клиенту ответ с ошибкой
      throw new BadRequestException('Ошибка загрузки файла');
    }
  }
}
