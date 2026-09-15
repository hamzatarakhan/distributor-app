import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CustomerApi, InvoiceApi, OrderApi, ProductApi, ProfileApi, RepApi, ReturnApi, VisitApi,
} from '@/src/api/resources';
import { getLog, logActivity } from '@/src/lib/activityLog';
import { getQueue } from '@/src/lib/offlineQueue';
import type { OrderLine, OrderStatus, PaymentMethod, ReturnLine, Visit, VisitOutcome } from '@/src/api/types';

// ---- Offline order queue (Phase 2) — sharing the 'offlineQueue' query key with Sync queue's own
// invalidations means this count updates on its own whenever an order is queued or synced,
// without Home needing to know about either of those flows.
export const useOfflineQueueCount = () =>
  useQuery({ queryKey: ['offlineQueue'], queryFn: async () => (await getQueue()).length });

// ---- Activity log / notification inbox (Phase 2) ----
export const useActivityLog = () => useQuery({ queryKey: ['activityLog'], queryFn: getLog });

// ---- Products ----
export const useProducts = (params: { search?: string; stockFilter?: 'all' | 'low' | 'out' } = {}) =>
  useQuery({ queryKey: ['products', params], queryFn: () => ProductApi.list(params) });

// ---- Customers (Phase 2 — balance / credit-limit) ----
export const useCustomer = (id: number) =>
  useQuery({ queryKey: ['customer', id], queryFn: () => CustomerApi.get(id), enabled: !!id });

// Manager's customer picker when assigning a visit
export const useCustomers = () => useQuery({ queryKey: ['customers'], queryFn: CustomerApi.list });

// ---- Visits ----
export const useVisits = (params: { search?: string; status?: string } = {}) =>
  useQuery({ queryKey: ['visits', params], queryFn: () => VisitApi.list(params) });

export const useVisit = (id: number) =>
  useQuery({ queryKey: ['visit', id], queryFn: () => VisitApi.get(id), enabled: !!id });

// ---- Reps / manager: assigning visits ----
export const useReps = () => useQuery({ queryKey: ['reps'], queryFn: RepApi.list });

export function useCreateVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { customerId: number; repId: number; scheduledTime?: string; fail?: boolean }) =>
      VisitApi.create(v, v.fail),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visits'] }),
  });
}

export function useConfirmVisit(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { outcome: VisitOutcome; note?: string; photoUri?: string; fail?: boolean }) =>
      VisitApi.confirm(id, v.outcome, v),
    onSuccess: async (visit) => {
      qc.invalidateQueries({ queryKey: ['visits'] });
      qc.invalidateQueries({ queryKey: ['visit', id] });
      if (visit.outcome === 'no_sale') {
        await logActivity('close-circle-outline', 'neutral', 'activity.noSale', { name: visit.customerName });
        qc.invalidateQueries({ queryKey: ['activityLog'] });
      }
    },
  });
}

export function useCheckIn(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { checkIn: NonNullable<Visit['checkIn']>; photoUri?: string; fail?: boolean }) =>
      VisitApi.checkin(id, v.checkIn, v.photoUri, v.fail),
    onSuccess: async (visit) => {
      qc.invalidateQueries({ queryKey: ['visits'] });
      qc.invalidateQueries({ queryKey: ['visit', id] });
      await logActivity('navigate-circle-outline', 'info', 'activity.checkedIn', { name: visit.customerName });
      qc.invalidateQueries({ queryKey: ['activityLog'] });
    },
  });
}

// ---- Orders ----
export const useOrders = (params: { search?: string; hasReturn?: boolean; status?: 'all' | OrderStatus } = {}) =>
  useQuery({ queryKey: ['orders', params], queryFn: () => OrderApi.list(params) });

export const useOrder = (id: number) =>
  useQuery({ queryKey: ['order', id], queryFn: () => OrderApi.get(id), enabled: !!id });

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      visitId?: number; customerId: number; customerName: string; lines: OrderLine[]; fail?: boolean;
    }) => OrderApi.create(v, v.fail),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}

export function useConfirmOrder(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { signature?: string[]; fail?: boolean } = {}) => OrderApi.confirm(id, v.signature, v.fail),
    onSuccess: async (res) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      await logActivity('cart-outline', 'success', 'activity.orderConfirmed', { name: res.order.customerName });
      qc.invalidateQueries({ queryKey: ['activityLog'] });
    },
  });
}

export function useCreateReturn(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { lines: ReturnLine[]; fail?: boolean }) => ReturnApi.create(orderId, v.lines, v.fail),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['order', orderId] });
    },
  });
}

// ---- Invoices ----
export const useInvoices = (params: { search?: string; filter?: string }) =>
  useQuery({ queryKey: ['invoices', params], queryFn: () => InvoiceApi.list(params) });

export const useInvoice = (id: number) =>
  useQuery({ queryKey: ['invoice', id], queryFn: () => InvoiceApi.get(id), enabled: !!id });

export function useRecordPayment(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { method: PaymentMethod; amount: number; fail?: boolean }) =>
      InvoiceApi.recordPayment(id, v.method, v.amount, v.fail),
    onSuccess: async (invoice) => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoice', id] });
      qc.invalidateQueries({ queryKey: ['customer'] });
      await logActivity('cash-outline', 'success', 'activity.paymentRecorded', { name: invoice.customerName });
      qc.invalidateQueries({ queryKey: ['activityLog'] });
    },
  });
}

// ---- Profile ----
export const useProfile = () => useQuery({ queryKey: ['profile'], queryFn: ProfileApi.get });
