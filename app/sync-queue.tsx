import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Card, EmptyState, Screen, Text } from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import { OrderApi } from '@/src/api/resources';
import { getQueue, removeFromQueue, type QueuedOrder } from '@/src/lib/offlineQueue';
import { useIsOnline } from '@/src/lib/useOnline';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function SyncQueue() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const online = useIsOnline();
  const qc = useQueryClient();
  const [queue, setQueue] = useState<QueuedOrder[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = () => getQueue().then(setQueue);
  useEffect(() => {
    load();
  }, []);

  const syncOne = async (item: QueuedOrder) => {
    setSyncingId(item.id);
    setErrors((e) => ({ ...e, [item.id]: '' }));
    try {
      await OrderApi.create(item.payload);
      await removeFromQueue(item.id);
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['visits'] });
      await load();
    } catch (e) {
      setErrors((s) => ({ ...s, [item.id]: errorMessage(e) }));
    } finally {
      setSyncingId(null);
    }
  };

  const syncAll = async () => {
    for (const item of queue) await syncOne(item);
  };

  return (
    <Screen
      onRefresh={load}
      header={
        <Text tone={online ? 'success' : 'danger'} variant="caption">
          {online ? t('syncQueue.online') : t('syncQueue.offline')}
        </Text>
      }
      empty={queue.length === 0}
      emptyText={t('syncQueue.emptyText')}>
      {queue.length > 0 ? (
        <Button title={t('syncQueue.syncAll')} onPress={syncAll} disabled={!online} fullWidth />
      ) : null}
      <View style={{ gap: spacing.md }}>
        {queue.map((item) => (
          <Card key={item.id}>
            <Text variant="title">{item.payload.customerName}</Text>
            <Text variant="caption" tone="muted">
              {t('syncQueue.lineCount', { count: item.payload.lines.length })} · {new Date(item.createdAt).toLocaleString()}
            </Text>
            {errors[item.id] ? <Text variant="caption" tone="danger">{errors[item.id]}</Text> : null}
            <Button
              variant="secondary"
              title={t('syncQueue.syncNow')}
              onPress={() => syncOne(item)}
              loading={syncingId === item.id}
              disabled={!online}
            />
          </Card>
        ))}
      </View>
    </Screen>
  );
}
