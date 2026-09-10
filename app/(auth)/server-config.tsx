import { router } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Button, Card, Text } from '@/src/components';
import { useAuth } from '@/src/auth/AuthContext';
import { api } from '@/src/api';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function ServerConfig() {
  const { colors, spacing, radii } = useTheme();
  const { server, database, setServer } = useAuth();
  const [url, setUrl] = useState(server);
  const [db, setDb] = useState(database ?? '');
  const [testState, setTestState] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');

  const field = (label: string, value: string, onChange: (t: string) => void, placeholder: string) => (
    <View style={{ gap: 6 }}>
      <Text variant="captionSemi" tone="muted">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radii.md,
          padding: 12,
          color: colors.text,
          fontSize: 15,
        }}
      />
    </View>
  );

  const test = async () => {
    setTestState('testing');
    try {
      const res = await fetch(`${url.replace(/\/$/, '')}/web/webclient/version_info`, { method: 'GET' });
      setTestState(res.ok ? 'ok' : 'fail');
    } catch {
      setTestState(api.transportName() === 'mock' ? 'ok' : 'fail');
    }
  };

  const save = async () => {
    await setServer(url.replace(/\/$/, ''), db || undefined);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.lg }}>
      {field('Odoo base URL', url, setUrl, 'https://erp.company.com')}
      {field('Database (optional)', db, setDb, 'company-prod')}

      <Button variant="secondary" title="Test connection" onPress={test} loading={testState === 'testing'} />
      {testState === 'ok' ? <Text tone="success" variant="caption">Reachable ✓</Text> : null}
      {testState === 'fail' ? <Text tone="danger" variant="caption">Could not reach that server.</Text> : null}

      <Card>
        <Text variant="caption" tone="muted">
          Current transport: <Text variant="captionSemi">{api.transportName()}</Text>. While it is
          &ldquo;mock&rdquo; the app runs on sample data and any URL is accepted.
        </Text>
      </Card>

      <Button title="Save" onPress={save} disabled={!url} fullWidth />
    </View>
  );
}
