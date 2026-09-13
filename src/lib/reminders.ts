import * as Notifications from 'expo-notifications';
import type { Visit } from '@/src/api/types';

// Phase 2 — LOCAL scheduled notifications only (no push server involved), which is all a
// same-day visit reminder needs. Expo Go has dropped remote push on Android, but on-device
// local notifications like these still work there.
const REMINDER_MINUTES_BEFORE = 15;

export async function areRemindersScheduled(): Promise<boolean> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.length > 0;
}

export async function scheduleTodayReminders(visits: Visit[]): Promise<{ scheduled: number }> {
  const perm = await Notifications.requestPermissionsAsync();
  if (perm.status !== 'granted') throw new Error('Notification permission denied');

  await Notifications.cancelAllScheduledNotificationsAsync();
  const now = new Date();
  let scheduled = 0;

  for (const v of visits) {
    if (!v.scheduledTime) continue;
    const [h, m] = v.scheduledTime.split(':').map(Number);
    const at = new Date(now);
    at.setHours(h, m - REMINDER_MINUTES_BEFORE, 0, 0);
    if (at <= now) continue; // don't schedule reminders for times already passed today

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Upcoming visit: ${v.customerName}`,
        body: `Scheduled at ${v.scheduledTime}${v.address ? ` — ${v.address}` : ''}`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
    });
    scheduled += 1;
  }
  return { scheduled };
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
