import { useTranslation } from 'react-i18next';
import { Card, DetailRow, Screen } from '@/src/components';
import { useProfile } from '@/src/hooks/data';

export default function ProfileScreen() {
  const { data, isLoading, error, refetch } = useProfile();
  const { t } = useTranslation();
  return (
    <Screen loading={isLoading} error={error} onRetry={refetch}>
      {data ? (
        <Card>
          <DetailRow label={t('profile.name')} value={data.name} />
          <DetailRow label={t('profile.username')} value={data.login} />
          <DetailRow label={t('profile.email')} value={data.email ?? '—'} />
          <DetailRow label={t('profile.phone')} value={data.phone ?? '—'} />
          <DetailRow label={t('profile.company')} value={data.company ?? '—'} />
          <DetailRow label={t('profile.vehicle')} value={data.warehouses?.join(', ') ?? '—'} />
        </Card>
      ) : null}
    </Screen>
  );
}
