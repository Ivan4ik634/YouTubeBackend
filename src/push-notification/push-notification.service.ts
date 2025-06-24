import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PushNotificationService {
  async sendPushNotification(title: string, message: string, url?: string) {
    try {
      await axios.post(
        'https://onesignal.com/api/v1/notifications',
        {
          app_id: '843913d7-6e97-42a2-9aac-62fe3c27b9a1',
          included_segments: ['Subscribed Users'], // або user_ids
          headings: { en: title },
          contents: { en: message },
          url: url || 'https://white-youtube.vercel.app',
        },
        {
          headers: {
            Authorization: `Basic os_v2_app_qq4rhv3os5bkfgvmml7dyj5zugdraw74k3vuwz5ygmpdyuykpxapoxdlghgvcpm4iawn7g2746opymoywfbzfbyyafsy56b6uyna3oi`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (err) {
      console.error('Push error:', err.response?.data || err.message);
    }
  }
}
