import { Button } from './Button';
import { Sheet } from './Sheet';
import { Text } from './Text';

export function ConfirmSheet({
  visible,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Sheet visible={visible} onClose={onCancel}>
      <Text variant="h2">{title}</Text>
      {description ? <Text tone="muted">{description}</Text> : null}
      <Button
        fullWidth
        title={confirmLabel}
        variant={destructive ? 'danger' : 'primary'}
        onPress={onConfirm}
      />
      <Button fullWidth title="Cancel" variant="ghost" onPress={onCancel} />
    </Sheet>
  );
}
