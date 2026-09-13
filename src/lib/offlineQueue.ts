import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OrderLine } from '@/src/api/types';

// Phase 2 offline mode, scoped to the highest-value case: building an order with no signal.
// Other write actions (visit confirm, returns, payments) aren't queued yet — a deliberate scope
// cut, not an oversight; extend this same pattern to them if the client asks for it.
// ponytail: single flat queue, no conflict resolution — fine for one rep's own pending orders,
// would need per-item retry/backoff and merge logic to scale past that.
export type QueuedOrder = {
  id: string;
  createdAt: string;
  payload: { visitId?: number; customerId: number; customerName: string; lines: OrderLine[] };
};

const KEY = 'offline.orderQueue.v1';

export async function getQueue(): Promise<QueuedOrder[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function setQueue(queue: QueuedOrder[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(queue));
}

export async function enqueueOrder(payload: QueuedOrder['payload']): Promise<QueuedOrder> {
  const item: QueuedOrder = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString(), payload };
  const queue = await getQueue();
  await setQueue([...queue, item]);
  return item;
}

export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getQueue();
  await setQueue(queue.filter((q) => q.id !== id));
}
