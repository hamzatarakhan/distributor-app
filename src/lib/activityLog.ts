import AsyncStorage from '@react-native-async-storage/async-storage';
import type { IconName } from '@/src/components';
import type { BadgeTone } from '@/src/theme/tokens';

// A lightweight in-app notification inbox (Phase 2) — logs things the rep already did (order
// confirmed, check-in saved, payment recorded, offline order synced) so there's a place to
// glance back at the day's activity. Not a push-notification system — it's a local log, written
// to whenever a relevant mutation succeeds (see the `onSuccess` handlers in src/hooks/data.ts and
// app/sync-queue.tsx). Capped at 50 entries so it can't grow unbounded on-device.
export type ActivityItem = {
  id: string;
  icon: IconName;
  tone: BadgeTone;
  textKey: string;
  params: Record<string, string>;
  at: string;
  read: boolean;
};

const KEY = 'activity.log.v1';
const MAX_ITEMS = 50;

export async function getLog(): Promise<ActivityItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function setLog(items: ActivityItem[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

export async function logActivity(icon: IconName, tone: BadgeTone, textKey: string, params: Record<string, string> = {}) {
  const item: ActivityItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    icon, tone, textKey, params,
    at: new Date().toISOString(),
    read: false,
  };
  const log = await getLog();
  await setLog([item, ...log].slice(0, MAX_ITEMS));
}

export async function markAllRead() {
  const log = await getLog();
  if (log.every((i) => i.read)) return;
  await setLog(log.map((i) => ({ ...i, read: true })));
}
