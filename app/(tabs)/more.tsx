import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Constants from 'expo-constants';
import { Card, ConfirmSheet, Icon, ListRow, Screen, Text } from '@/src/components';
import { useAuth } from '@/src/auth/AuthContext';
import { useProfile } from '@/src/hooks/data';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function More() {
  const { colors, spacing } = useTheme();
  const { signOut, session } = useAuth();
  const profile = useProfile();
  const [confirm, setConfirm] = useState(false);

  return (
    <Screen>
      <Card>
        <Text variant="title">{profile.data?.name ?? session?.name ?? 'Account'}</Text>
        <Text variant="caption" tone="muted">{profile.data?.email ?? session?.login}</Text>
        {profile.data?.company ? (
          <Text variant="caption" tone="faint">{profile.data.company}</Text>
        ) : null}
      </Card>

      <View style={{ gap: spacing.md }}>
        <ListRow
          title="Profile"
          left={<Icon name="person-outline" color={colors.textMuted} />}
          onPress={() => router.push('/settings/profile')}
        />
        <ListRow
          title="Appearance"
          left={<Icon name="contrast-outline" color={colors.textMuted} />}
          onPress={() => router.push('/settings/theme')}
        />
        <ListRow
          title="Server / connection"
          left={<Icon name="server-outline" color={colors.textMuted} />}
          onPress={() => router.push('/(auth)/server-config')}
        />
        <ListRow
          title="About"
          left={<Icon name="information-circle-outline" color={colors.textMuted} />}
          onPress={() => router.push('/settings/about')}
        />
        {__DEV__ ? (
          <ListRow
            title="Kitchen sink (dev)"
            left={<Icon name="flask-outline" color={colors.textMuted} />}
            onPress={() => router.push('/kitchen-sink')}
          />
        ) : null}
        <ListRow
          title="Sign out"
          chevron={false}
          left={<Icon name="log-out-outline" color={colors.danger} />}
          onPress={() => setConfirm(true)}
        />
      </View>

      <Text variant="caption" tone="faint" style={{ textAlign: 'center' }}>
        v{Constants.expoConfig?.version ?? '1.0.0'}
      </Text>

      <ConfirmSheet
        visible={confirm}
        title="Sign out?"
        description="You'll need to sign in again to use the app."
        confirmLabel="Sign out"
        destructive
        onConfirm={() => {
          setConfirm(false);
          signOut();
        }}
        onCancel={() => setConfirm(false)}
      />
    </Screen>
  );
}
