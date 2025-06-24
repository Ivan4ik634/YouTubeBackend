import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PushNotificationService {
  async sendPushNotification(playerIds: string[], title: string, message: string, url?: string) {
    try {
      const res = await axios.post(
        'https://api.onesignal.com/notifications?c=push',
        {
          app_id: '843913d7-6e97-42a2-9aac-62fe3c27b9a1',
          include_player_ids: playerIds,
          headings: { en: title },
          contents: { en: message },
          url: 'https://white-youtube.vercel.app',
        },
        {
          headers: {
            accept: 'application/json',
            Authorization:
              'Key os_v2_app_qq4rhv3os5bkfgvmml7dyj5zuhvowilxf2welxnnwqj3pju46bqoup3op5ogavfnsanldyai44zuyadsm2qzb4ml453jffdnm4ozeiy',
            'content-type': 'application/json',
          },
        },
      );
      return res.data;
    } catch (err) {
      console.error('Push error:', err.response?.data || err.message);
    }
  }
}

/**
 * 
 * <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: "3e8a3d71-2c39-427b-ae72-81821e5dded4",
      safari_web_id: "web.onesignal.auto.3cbb98e8-d926-4cfe-89ae-1bc86ff7cf70",
      notifyButton: {
        enable: true,
      },
    });
  });
</script>
 */
