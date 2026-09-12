import type { BadgeTone } from '@/src/theme/tokens';
import type { InvoiceStatus, OrderStatus, VisitStatus } from '@/src/api/types';

// Label comes from i18n via `t()` at the call site — this just maps status → badge tone and →
// translation key, so a Badge is built as `<Badge label={t(visitStatusKey[s])} tone={visitStatusTone[s]} />`.
export const visitStatusTone: Record<VisitStatus, BadgeTone> = {
  planned: 'info',
  done: 'success',
  skipped: 'neutral',
};
export const visitStatusKey: Record<VisitStatus, string> = {
  planned: 'status.visit.planned',
  done: 'status.visit.done',
  skipped: 'status.visit.skipped',
};

export const orderStatusTone: Record<OrderStatus, BadgeTone> = {
  draft: 'neutral',
  confirmed: 'info',
  invoiced: 'success',
};
export const orderStatusKey: Record<OrderStatus, string> = {
  draft: 'status.order.draft',
  confirmed: 'status.order.confirmed',
  invoiced: 'status.order.invoiced',
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
