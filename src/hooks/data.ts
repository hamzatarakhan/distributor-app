import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CustomerApi, InvoiceApi, OrderApi, ProductApi, ProfileApi, ReturnApi, VisitApi,
} from '@/src/api/resources';
import type { OrderLine, OrderStatus, PaymentMethod, ReturnLine, Visit, VisitOutcome } from '@/src/api/types';

// ---- Products ----
export const useProducts = (params: { search?: string; stockFilter?: 'all' | 'low' | 'out' } = {}) =>
  useQuery({ queryKey: ['products', params], queryFn: () => ProductApi.list(params) });

// ---- Customers (Phase 2 — balance / credit-limit) ----
export const useCustomer = (id: number) =>
  useQuery({ queryKey: ['customer', id], queryFn: () => CustomerApi.get(id), enabled: !!id });

// ---- Visits ----
export const useVisits = (params: { search?: string; status?: string } = {}) =>
  useQuery({ queryKey: ['visits', params], queryFn: () => VisitApi.list(params) });

export const useVisit = (id: number) =>
  useQuery({ queryKey: ['visit', id], queryFn: () => VisitApi.get(id), enabled: !!id });

export function useConfirmVisit(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { outcome: VisitOutcome; note?: string; photoUri?: string; fail?: boolean }) =>
      VisitApi.confirm(id, v.outcome, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visits'] });
      qc.invalidateQueries({ queryKey: ['visit', id] });
    },
  });
}

export function useCheckIn(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { checkIn: NonNullable<Visit['checkIn']>; photoUri?: string; fail?: boolean }) =>
      VisitApi.checkin(id, v.checkIn, v.photoUri, v.fail),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visits'] });
      qc.invalidateQueries({ queryKey: ['visit', id] });
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoice', id] });
      qc.invalidateQueries({ queryKey: ['customer'] });
    },
  });
}

// ---- Profile ----
export const useProfile = () => useQuery({ queryKey: ['profile'], queryFn: ProfileApi.get });
