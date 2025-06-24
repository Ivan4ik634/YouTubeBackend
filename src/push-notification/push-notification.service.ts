import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PushNotificationService {
  async sendPushNotification(title: string, message: string, url?: string) {
    try {
      await axios.post(
        'https://onesignal.com/api/v1/notifications',
        {
          app_id: process.env.ONE_SIGNAL_APP_ID,
          included_segments: ['Subscribed Users'], // або user_ids
          headings: { en: title },
          contents: { en: message },
          url: url || 'https://white-youtube.vercel.app',
        },
        {
          headers: {
            Authorization: `Basic ${process.env.ONE_SIGNAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (err) {
      console.error('Push error:', err.response?.data || err.message);
    }
  }
}
