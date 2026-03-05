import { useEffect, useRef } from 'react';
import api from '../api/axios';

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

export async function subscribeToPush() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;

    const { data } = await api.get('/auth/vapid-key');
    if (!data.publicKey) return null;

    const registration = await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      await api.post('/auth/push-subscribe', { subscription: existing.toJSON() });
      return existing;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    });

    await api.post('/auth/push-subscribe', { subscription: subscription.toJSON() });
    return subscription;
  } catch {
    return null;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function showLocalNotification(time) {
  if (getPermissionState() !== 'granted') return;
  const [h] = time.split(':').map(Number);
  new Notification('NutriScan', {
    body: getMealMessage(h),
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
        const id = setTimeout(() => showLocalNotification(time), ms);
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
