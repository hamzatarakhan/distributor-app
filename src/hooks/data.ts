import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DeliveryApi, InvoiceApi, ProfileApi, StockApi } from '@/src/api/resources';

// ---- Stock ----
export const useInventory = (params: { search?: string; lowOnly?: boolean } = {}) =>
  useQuery({ queryKey: ['inventory', params], queryFn: () => StockApi.inventory(params) });

export const useProduct = (productId: number) =>
  useQuery({ queryKey: ['product', productId], queryFn: () => StockApi.product(productId), enabled: !!productId });

export const useReceipts = (status: string) =>
  useQuery({ queryKey: ['receipts', status], queryFn: () => StockApi.receipts({ status }) });

export const useReceipt = (id: number) =>
  useQuery({ queryKey: ['receipt', id], queryFn: () => StockApi.receipt(id), enabled: !!id });

// ---- Deliveries ----
export const useDeliveries = (params: { search?: string; status?: string }) =>
  useQuery({ queryKey: ['deliveries', params], queryFn: () => DeliveryApi.list(params) });

export const useDelivery = (id: number) =>
  useQuery({ queryKey: ['delivery', id], queryFn: () => DeliveryApi.get(id), enabled: !!id });

export function useConfirmDelivery(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { lines: { id: number; doneQty: number }[]; note?: string; fail?: boolean }) =>
      DeliveryApi.confirm(id, v.lines, v.note, v.fail),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deliveries'] });
      qc.invalidateQueries({ queryKey: ['delivery', id] });
    },
  });
}

export function useConfirmReceipt(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { lines: { id: number; doneQty: number }[]; fail?: boolean }) =>
      StockApi.confirmReceipt(id, v.lines, v.fail),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['receipts'] });
      qc.invalidateQueries({ queryKey: ['receipt', id] });
      qc.invalidateQueries({ queryKey: ['inventory'] });
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
