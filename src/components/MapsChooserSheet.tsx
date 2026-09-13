import { Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { appleMapsUrl, googleMapsUrl, type MapTarget } from '@/src/lib/maps';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Icon } from './Icon';
import { ListRow } from './ListRow';
import { Sheet } from './Sheet';
import { Text } from './Text';

// iOS-only chooser (see src/lib/maps.ts for why) — Android never needs this, its own `geo:`
// intent already prompts a native app picker when more than one map app is installed.
export function MapsChooserSheet({
  target,
  onClose,
}: {
  target: MapTarget | null;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const open = (url: string) => {
    onClose();
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Sheet visible={!!target} onClose={onClose}>
      <Text variant="h2">{t('visitDetail.openInMaps')}</Text>
      {target ? (
        <>
          <ListRow
            title={t('visitDetail.appleMaps')}
            left={<Icon name="map-outline" color={colors.primary} />}
            onPress={() => open(appleMapsUrl(target))}
          />
          <ListRow
            title={t('visitDetail.googleMaps')}
            left={<Icon name="navigate-outline" color={colors.primary} />}
            onPress={() => open(googleMapsUrl(target))}
          />
        </>
      ) : null}
    </Sheet>
  );
}
