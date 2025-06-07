import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { PassThrough } from 'stream';
import { uploadSessions } from './store/chunk.store';

cloudinary.config({
  cloud_name: 'dshkbuopu',
  api_key: '511749955766279',
  api_secret: '90_uRqgavznEzTGwTDle6ZVQBZ4',
});
@Injectable()
export class UploadService {
  constructor() {}

  uploadFile(file: Express.Multer.File, isVideo: boolean) {
    const cleanedOriginalName = file.originalname.replace(/[^\x00-\x7F]/g, '');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'uploads',
          resource_type: isVideo ? 'video' : 'image',
          allowed_formats: !isVideo ? ['jpg', 'jpeg', 'png'] : ['mp4'],
          eager: isVideo
            ? [
                { width: 144, crop: 'scale' },
                { width: 360, crop: 'scale' },
                { width: 480, crop: 'scale' },
                { width: 720, crop: 'scale' },
                { width: 1080, crop: 'scale' },
              ]
            : '',
          eager_async: isVideo, // выполняется асинхронно
          public_id: cleanedOriginalName.split('.')[0],
        },
        (error, result) => {
          if (error) {
            console.error('Error uploading file to Cloudinary:', error);
            return reject(error);
          }
          resolve(isVideo ? result!.eager : result!.secure_url);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadChunk(
    file: Express.Multer.File,
    index: string,
    isLast: string,
    fileName: string,
  ) {
    const sessionKey = fileName;

    if (!uploadSessions.has(sessionKey)) {
      const passThrough = new PassThrough();

      let resolveFn: (result: any) => void;
      let rejectFn: (err: any) => void;

      const uploadPromise = new Promise((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;
      });

      const cloudinaryUploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          public_id: `videos/${Date.now()}-${fileName}`,
          chunk_size: 6 * 1024 * 1024,
          folder: 'uploads',
          allowed_formats: ['mp4'],
          eager: [
            { width: 144, crop: 'scale' },
            { width: 360, crop: 'scale' },
            { width: 480, crop: 'scale' },
            { width: 720, crop: 'scale' },
            { width: 1080, crop: 'scale' },
          ],
          eager_async: true,
        },
        (error, result) => {
          if (error) {
            rejectFn(error);
          } else {
            resolveFn(result);
          }
          uploadSessions.delete(sessionKey);
        },
      );

      passThrough.pipe(cloudinaryUploadStream);

      // Сохраняем сессию
      uploadSessions.set(sessionKey, {
        stream: passThrough,
        uploadPromise,
        resolve: resolveFn!,
        reject: rejectFn!,
      });
    }

    // Записываем текущий чанк в поток
    uploadSessions.get(sessionKey)!.stream.write(file.buffer);

    if (isLast === 'true') {
      // Завершаем поток — сообщаем Cloudinary, что данных больше нет
      uploadSessions.get(sessionKey)!.stream.end();

      // Ждём завершения загрузки
      const result = await uploadSessions.get(sessionKey)!.uploadPromise;

      return { url: result.eager };
    }

    console.log('Чанк отгрузился!');
    return null;
  }
}
