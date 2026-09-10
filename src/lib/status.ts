import type { BadgeTone } from '@/src/theme/tokens';
import type { InvoiceStatus, PickingStatus } from '@/src/api/types';

export const pickingStatus: Record<PickingStatus, { label: string; tone: BadgeTone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  waiting: { label: 'Waiting', tone: 'warning' },
  ready: { label: 'Ready', tone: 'info' },
  done: { label: 'Done', tone: 'success' },
  cancel: { label: 'Cancelled', tone: 'neutral' },
};

export const invoiceStatus: Record<InvoiceStatus, { label: string; tone: BadgeTone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  not_paid: { label: 'Not paid', tone: 'warning' },
  partial: { label: 'Partial', tone: 'info' },
  paid: { label: 'Paid', tone: 'success' },
  reversed: { label: 'Reversed', tone: 'neutral' },
};

export function isOverdue(dueDate: string | undefined, amountDue: number, now = new Date()): boolean {
  if (!dueDate || amountDue <= 0) return false;
  return dueDate < now.toISOString().slice(0, 10);
}
