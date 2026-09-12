import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { Card, DetailRow, Screen, Text } from '@/src/components';
import { api } from '@/src/api';
import { useAuth } from '@/src/auth/AuthContext';

export default function About() {
  const { server } = useAuth();
  const { t } = useTranslation();
  return (
    <Screen>
      <Card>
        <DetailRow label={t('about.version')} value={Constants.expoConfig?.version ?? '1.0.0'} />
        <DetailRow label={t('about.runtime')} value={Constants.expoConfig?.sdkVersion ?? '54'} />
        <DetailRow label={t('about.dataSource')} value={api.transportName()} />
        <DetailRow label={t('about.server')} value={server || '—'} />
      </Card>
      <Text variant="caption" tone="faint">
        {t('about.footer')}
      </Text>
    </Screen>
  );
}
