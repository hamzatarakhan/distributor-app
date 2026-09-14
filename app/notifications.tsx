import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Card, IconBadge, Screen, Text } from '@/src/components';
import { useActivityLog } from '@/src/hooks/data';
import { markAllRead } from '@/src/lib/activityLog';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function Notifications() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL, locale } = useLocale();
  const qc = useQueryClient();
  const { data, isLoading, error, refetch, isRefetching } = useActivityLog();
  const items = data ?? [];

  // Opening the inbox is the read action — matches how a phone's own notification center works.
  useEffect(() => {
    markAllRead().then(() => qc.invalidateQueries({ queryKey: ['activityLog'] }));
  }, [qc]);

  return (
    <Screen
      onRefresh={refetch}
      refreshing={isRefetching}
      loading={isLoading}
      error={error}
      onRetry={refetch}
      empty={!isLoading && items.length === 0}
      emptyText={t('activity.emptyText')}>
      <View style={{ gap: spacing.md }}>
        {items.map((item) => (
          <Card key={item.id} style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: spacing.md }}>
            <IconBadge icon={item.icon} tone={item.tone} />
            <View style={{ flex: 1 }}>
              <Text variant="captionSemi">{t(item.textKey, item.params)}</Text>
              <Text variant="caption" tone="faint">
                {new Date(item.at).toLocaleString(locale === 'ar' ? 'ar' : 'en-US', {
                  hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric',
                })}
              </Text>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
