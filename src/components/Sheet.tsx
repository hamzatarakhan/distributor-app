import { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Icon } from './Icon';

// Bottom sheet = native Modal anchored to the bottom. No extra library.
export function Sheet({
  visible,
  onClose,
  children,
  showClose = true,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  showClose?: boolean;
}) {
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
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
              style={{ position: 'absolute', top: spacing.lg, right: spacing.lg, zIndex: 1 }}>
              <Icon name="close" size={22} color={colors.textFaint} />
            </Pressable>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
