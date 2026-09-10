import { Card, DetailRow, Screen } from '@/src/components';
import { useProfile } from '@/src/hooks/data';

export default function ProfileScreen() {
  const { data, isLoading, error, refetch } = useProfile();
  return (
    <Screen loading={isLoading} error={error} onRetry={refetch}>
      {data ? (
        <Card>
          <DetailRow label="Name" value={data.name} />
          <DetailRow label="Username" value={data.login} />
          <DetailRow label="Email" value={data.email ?? '—'} />
          <DetailRow label="Phone" value={data.phone ?? '—'} />
          <DetailRow label="Company" value={data.company ?? '—'} />
          <DetailRow label="Warehouse" value={data.warehouses?.join(', ') ?? '—'} />
        </Card>
      ) : null}
    </Screen>
  );
}
