import { useEffect, useRef } from 'react';

function getMealMessage(hour) {
  if (hour < 10) return 'Time to log your breakfast!';
  if (hour < 14) return "Don't forget to log your lunch!";
  if (hour < 18) return 'Time to log your afternoon snack!';
  return 'Time to log your dinner!';
}

export function canUseNotifications() {
  return 'Notification' in window;
}

export function getPermissionState() {
  if (!canUseNotifications()) return 'unsupported';
  return Notification.permission;
}

export async function requestPermission() {
  if (!canUseNotifications()) return 'unsupported';
  return Notification.requestPermission();
}

function showNotification(time) {
  if (getPermissionState() !== 'granted') return;

  const [h] = time.split(':').map(Number);
  const message = getMealMessage(h);

  new Notification('NutriScan', {
    body: message,
    icon: '/icons/icon-192.png',
    tag: `nutriscan-${time}`,
  });
}

export default function useNotifications(user) {
  const timersRef = useRef([]);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (!user?.notificationsEnabled || !user?.notificationTimes?.length) return;
    if (getPermissionState() !== 'granted') return;

    const now = new Date();
    const todayBase = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (const time of user.notificationTimes) {
      const [h, m] = time.split(':').map(Number);
      const target = new Date(todayBase);
      target.setHours(h, m, 0, 0);

      const ms = target.getTime() - now.getTime();
      if (ms > 0) {
        const id = setTimeout(() => showNotification(time), ms);
        timersRef.current.push(id);
      }
    }

    const midnight = new Date(todayBase);
    midnight.setDate(midnight.getDate() + 1);
    const msToMidnight = midnight.getTime() - now.getTime();
    const midnightTimer = setTimeout(() => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    }, msToMidnight);
    timersRef.current.push(midnightTimer);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [user?.notificationsEnabled, user?.notificationTimes]);
}
