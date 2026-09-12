import type { BadgeTone } from '@/src/theme/tokens';
import type { InvoiceStatus, PickingStatus } from '@/src/api/types';

// Label comes from i18n (`status.picking.*` / `status.invoice.*`) via `t()` at the call site —
// this just maps status → badge tone and → translation key, so a Badge is built as
// `<Badge label={t(pickingStatusKey[s])} tone={pickingStatusTone[s]} />`.
export const pickingStatusTone: Record<PickingStatus, BadgeTone> = {
  draft: 'neutral',
  waiting: 'warning',
  ready: 'info',
  done: 'success',
  cancel: 'neutral',
};
export const pickingStatusKey: Record<PickingStatus, string> = {
  draft: 'status.picking.draft',
  waiting: 'status.picking.waiting',
  ready: 'status.picking.ready',
  done: 'status.picking.done',
  cancel: 'status.picking.cancel',
};

export const invoiceStatusTone: Record<InvoiceStatus, BadgeTone> = {
  draft: 'neutral',
  not_paid: 'warning',
  partial: 'info',
  paid: 'success',
  reversed: 'neutral',
};
export const invoiceStatusKey: Record<InvoiceStatus, string> = {
  draft: 'status.invoice.draft',
  not_paid: 'status.invoice.not_paid',
  partial: 'status.invoice.partial',
  paid: 'status.invoice.paid',
  reversed: 'status.invoice.reversed',
};

export function isOverdue(dueDate: string | undefined, amountDue: number, now = new Date()): boolean {
  if (!dueDate || amountDue <= 0) return false;
  return dueDate < now.toISOString().slice(0, 10);
}
