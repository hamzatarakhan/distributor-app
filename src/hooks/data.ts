import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { InvoiceApi, OrderApi, ProductApi, ProfileApi, ReturnApi, VisitApi } from '@/src/api/resources';
import type { OrderLine, ReturnLine, VisitOutcome } from '@/src/api/types';

// ---- Products ----
export const useProducts = (params: { search?: string } = {}) =>
  useQuery({ queryKey: ['products', params], queryFn: () => ProductApi.list(params) });

// ---- Visits ----
export const useVisits = (params: { search?: string; status?: string } = {}) =>
  useQuery({ queryKey: ['visits', params], queryFn: () => VisitApi.list(params) });

export const useVisit = (id: number) =>
  useQuery({ queryKey: ['visit', id], queryFn: () => VisitApi.get(id), enabled: !!id });

export function useConfirmVisit(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { outcome: VisitOutcome; note?: string; fail?: boolean }) =>
      VisitApi.confirm(id, v.outcome, v.note, v.fail),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visits'] });
      qc.invalidateQueries({ queryKey: ['visit', id] });
    },
  });
}

// ---- Orders ----
export const useOrders = (params: { search?: string; hasReturn?: boolean } = {}) =>
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
    mutationFn: (v: { fail?: boolean } = {}) => OrderApi.confirm(id, v.fail),
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

// ---- Profile ----
export const useProfile = () => useQuery({ queryKey: ['profile'], queryFn: ProfileApi.get });
