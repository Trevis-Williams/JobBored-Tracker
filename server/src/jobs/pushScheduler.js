import webpush from 'web-push';
import User from '../models/User.js';
import logger from '../config/logger.js';

function getMealMessage(hour) {
  if (hour < 10) return 'Time to log your breakfast!';
  if (hour < 14) return "Don't forget to log your lunch!";
  if (hour < 18) return 'Time to log your afternoon snack!';
  return 'Time to log your dinner!';
}

async function checkAndSend() {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  try {
    const users = await User.find({
      notificationsEnabled: true,
      notificationTimes: currentTime,
      pushSubscription: { $ne: null },
    });

    for (const user of users) {
      const hour = now.getHours();
      const payload = JSON.stringify({
        title: 'NutriScan',
        body: getMealMessage(hour),
      });

      try {
        await webpush.sendNotification(user.pushSubscription, payload);
        logger.info({ userId: user._id, time: currentTime }, 'Push notification sent');
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          user.pushSubscription = null;
          await user.save();
          logger.info({ userId: user._id }, 'Removed expired push subscription');
        } else {
          logger.error({ err, userId: user._id }, 'Failed to send push notification');
        }
      }
    }
  } catch (err) {
    logger.error({ err }, 'Push scheduler error');
  }
}

export function startPushScheduler() {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    logger.warn('VAPID keys not configured — push notifications disabled');
    return;
  }

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@nutriscan.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  setInterval(checkAndSend, 60 * 1000);
  logger.info('Push notification scheduler started');
}
