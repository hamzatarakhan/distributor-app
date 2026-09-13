import { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { Icon } from './Icon';

// Bottom sheet = native Modal anchored to the bottom. No extra library.
export function Sheet({
  visible,
  onClose,
  children,
  showClose = true,
  dismissable = true,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  showClose?: boolean;
  // Set false for content where an accidental backdrop tap would destroy unsaved work (e.g. a
  // hand-drawn signature) — closing is then only possible via the explicit X button.
  dismissable?: boolean;
}) {
  const { colors, spacing, radii } = useTheme();
  const { isRTL } = useLocale();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={dismissable ? onClose : () => {}}>
      <Pressable
        onPress={dismissable ? onClose : undefined}
        style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: radii.lg,
            borderTopRightRadius: radii.lg,
            padding: spacing.xl,
            paddingBottom: spacing.xl + insets.bottom,
            gap: spacing.md,
          }}>
          {showClose ? (
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={{
                position: 'absolute',
                top: spacing.lg,
                zIndex: 1,
                ...(isRTL ? { left: spacing.lg } : { right: spacing.lg }),
              }}>
              <Icon name="close" size={22} color={colors.textFaint} />
            </Pressable>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
