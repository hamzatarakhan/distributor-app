import { router } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Card, IconBadge, Text } from '@/src/components';
import type { IconName } from '@/src/components';
import type { BadgeTone } from '@/src/theme/tokens';
import { useAuth } from '@/src/auth/AuthContext';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { api } from '@/src/api';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function ServerConfig() {
  const { colors, spacing, radii } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const { server, database, setServer } = useAuth();
  const [url, setUrl] = useState(server);
  const [db, setDb] = useState(database ?? '');
  const [testState, setTestState] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');

  const field = (icon: IconName, tone: BadgeTone, label: string, value: string, onChange: (t: string) => void, placeholder: string) => (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: spacing.sm }}>
        <IconBadge icon={icon} tone={tone} />
        <Text variant="captionSemi" tone="muted">{label}</Text>
      </View>
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
      {field('globe-outline', 'info', t('auth.serverConfig.urlLabel'), url, setUrl, 'https://erp.company.com')}
      {field('albums-outline', 'special', t('auth.serverConfig.dbLabel'), db, setDb, 'company-prod')}

      <Button variant="secondary" title={t('auth.serverConfig.testConnection')} onPress={test} loading={testState === 'testing'} />
      {testState === 'ok' ? <Text tone="success" variant="caption">{t('auth.serverConfig.reachable')}</Text> : null}
      {testState === 'fail' ? <Text tone="danger" variant="caption">{t('auth.serverConfig.unreachable')}</Text> : null}

      <Card>
        <Text variant="caption" tone="muted">
          {t('auth.serverConfig.transportNote', { transport: api.transportName() })}
        </Text>
      </Card>

      <Button title={t('auth.serverConfig.save')} onPress={save} disabled={!url} fullWidth />
    </View>
  );
}
