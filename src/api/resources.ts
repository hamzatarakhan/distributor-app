import { api } from './index';
import type {
  Invoice, InventoryItem, Paged, Picking, Profile, StockMove,
} from './types';

export const StockApi = {
  inventory: (p: { search?: string; lowOnly?: boolean } = {}) =>
    api.request<Paged<InventoryItem>>('stock.inventory', p),
  product: (productId: number) =>
    api.request<InventoryItem & { moves: StockMove[] }>('stock.product', { productId }),
  receipts: (p: { status?: string } = {}) =>
    api.request<Paged<Picking>>('stock.receipts', p),
  receipt: (id: number) => api.request<Picking>('stock.receipt', { id }),
  confirmReceipt: (id: number, lines: { id: number; doneQty: number }[], fail?: boolean) =>
    api.request<{ reference: string; status: string }>('stock.receipt.confirm', { id, lines, __fail: fail }),
};

export const DeliveryApi = {
  list: (p: { search?: string; status?: string } = {}) =>
    api.request<Paged<Picking>>('delivery.list', p),
  get: (id: number) => api.request<Picking>('delivery.get', { id }),
  confirm: (id: number, lines: { id: number; doneQty: number }[], note?: string, fail?: boolean) =>
    api.request<{ reference: string; status: string }>('delivery.confirm', { id, lines, note, __fail: fail }),
};

export const InvoiceApi = {
  list: (p: { search?: string; filter?: string } = {}) =>
    api.request<Paged<Invoice>>('invoice.list', p),
  get: (id: number) => api.request<Invoice>('invoice.get', { id }),
  pdf: (id: number) => api.request<{ url: string }>('invoice.pdf', { id }),
};

export const ProfileApi = {
  get: () => api.request<Profile>('profile.get'),
};
