import { ReactNode } from 'react';
import {
  RefreshControl,
  ScrollView,
  View,
  type ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/theme/ThemeProvider';
import { EmptyState } from './EmptyState';
import { ErrorBanner } from './ErrorBanner';
import { LoadingRows } from './Skeleton';

type Props = {
  children: ReactNode;
  // Rendered above `children` and never swapped out for a loading/error/empty state — put a
  // SearchBar/FilterChips row here. Without this slot, searching to zero results (or the
  // in-flight instant while React Query treats a new search term as an uncached query) replaced
  // the whole screen with the empty/loading state, taking the search box away with it.
  header?: ReactNode;
  scroll?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  empty?: boolean;
  emptyText?: string;
  padded?: boolean;
  footer?: ReactNode; // e.g. a StickyActionBar
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
};

export function Screen({
  children,
  header,
  scroll = true,
  onRefresh,
  refreshing,
  loading,
  error,
  onRetry,
  empty,
  emptyText,
  padded = true,
  footer,
  contentContainerStyle,
}: Props) {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const pad = padded ? spacing.lg : 0;

  let body: ReactNode = children;
  if (loading) body = <LoadingRows />;
  else if (error) body = <ErrorBanner error={error} onRetry={onRetry} />;
  else if (empty) body = <EmptyState text={emptyText ?? t('common.nothingHereYet')} />;

  const content = (
    <>
      {header}
      {body}
    </>
  );

  const inner = (
    <View style={{ flex: 1, padding: pad, gap: spacing.md }}>{content}</View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            { padding: pad, gap: spacing.md, flexGrow: 1 },
            contentContainerStyle,
          ]}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={!!refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            ) : undefined
          }
          keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      ) : (
        inner
      )}
      {footer ? (
        <View style={{ paddingBottom: insets.bottom }}>{footer}</View>
      ) : null}
    </View>
  );
}
