import { PassThrough } from 'stream';

export const uploadSessions = new Map<
  string,
  {
    stream: PassThrough;
    uploadPromise: Promise<any>;
    resolve: (result: any) => void;
    reject: (err: any) => void;
  }
>();
