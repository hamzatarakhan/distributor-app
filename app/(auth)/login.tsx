import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Text } from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import { useAuth } from '@/src/auth/AuthContext';
import { useTheme } from '@/src/theme/ThemeProvider';

function LabeledInput(props: React.ComponentProps<typeof TextInput> & { label: string; right?: React.ReactNode }) {
  const { colors, radii } = useTheme();
  const { label, right, style, ...rest } = props;
  return (
    <View style={{ gap: 6 }}>
      <Text variant="captionSemi" tone="muted">{label}</Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radii.md,
          paddingHorizontal: 12,
        }}>
        <TextInput
          placeholderTextColor={colors.textFaint}
          style={[{ flex: 1, color: colors.text, paddingVertical: 12, fontSize: 15 }, style]}
          {...rest}
        />
        {right}
      </View>
    </View>
  );
}

export default function Login() {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { signIn, server } = useAuth();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await signIn(login.trim(), password);
      router.replace('/(tabs)');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flex: 1,
          padding: spacing.xl,
          paddingTop: insets.top + spacing.xxl,
          gap: spacing.lg,
          justifyContent: 'center',
        }}>
        <View style={{ alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
          <View
            style={{
              width: 64, height: 64, borderRadius: 18,
              backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center',
            }}>
            <Icon name="cube" size={32} color={colors.primary} />
          </View>
          <Text variant="h1">{t('auth.login.title')}</Text>
          <Text tone="muted" variant="caption">{t('auth.login.subtitle')}</Text>
        </View>

        <LabeledInput
          label={t('auth.login.usernameLabel')}
          value={login}
          onChangeText={setLogin}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@company.com"
        />
        <LabeledInput
          label={t('auth.login.passwordLabel')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!show}
          placeholder="••••••••"
          right={
            <Pressable onPress={() => setShow((s) => !s)} hitSlop={10}>
              <Icon name={show ? 'eye-off' : 'eye'} size={18} color={colors.textFaint} />
            </Pressable>
          }
        />

        {error ? <Text tone="danger" variant="caption">{error}</Text> : null}

        <Button title={t('auth.login.signIn')} onPress={submit} loading={busy} disabled={!login || !password} fullWidth />

        <Pressable onPress={() => router.push('/(auth)/server-config')} style={{ alignSelf: 'center' }}>
          <Text tone="primary" variant="caption">
            {server ? t('auth.login.serverPrefix', { server }) : t('auth.login.changeServer')}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
