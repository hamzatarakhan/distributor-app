import Constants from 'expo-constants';
import { Card, DetailRow, Screen, Text } from '@/src/components';
import { api } from '@/src/api';
import { useAuth } from '@/src/auth/AuthContext';

export default function About() {
  const { server } = useAuth();
  return (
    <Screen>
      <Card>
        <DetailRow label="Version" value={Constants.expoConfig?.version ?? '1.0.0'} />
        <DetailRow label="Runtime" value={Constants.expoConfig?.sdkVersion ?? '54'} />
        <DetailRow label="Data source" value={api.transportName()} />
        <DetailRow label="Server" value={server || '—'} />
      </Card>
      <Text variant="caption" tone="faint">
        Distributor app for stock, delivery and invoicing on Odoo.
      </Text>
    </Screen>
  );
}
