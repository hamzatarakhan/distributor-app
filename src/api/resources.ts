import { api } from './index';
import type {
  Invoice, Order, OrderLine, Paged, Product, Profile, ReturnLine, ReturnRecord, Visit, VisitOutcome,
} from './types';

export const ProductApi = {
  list: (p: { search?: string } = {}) => api.request<Paged<Product>>('product.list', p),
  get: (id: number) => api.request<Product>('product.get', { id }),
};

export const VisitApi = {
  list: (p: { search?: string; status?: string } = {}) => api.request<Paged<Visit>>('visit.list', p),
  get: (id: number) => api.request<Visit>('visit.get', { id }),
  confirm: (id: number, outcome: VisitOutcome, note?: string, fail?: boolean) =>
    api.request<Visit>('visit.confirm', { id, outcome, note, __fail: fail }),
};

export const OrderApi = {
  list: (p: { search?: string; hasReturn?: boolean } = {}) => api.request<Paged<Order>>('order.list', p),
  get: (id: number) => api.request<Order>('order.get', { id }),
  create: (
    v: { visitId?: number; customerId: number; customerName: string; lines: OrderLine[] },
    fail?: boolean,
  ) => api.request<Order>('order.create', { ...v, __fail: fail }),
  confirm: (id: number, fail?: boolean) =>
    api.request<{ order: Order; invoice: Invoice }>('order.confirm', { id, __fail: fail }),
};

export const ReturnApi = {
  create: (orderId: number, lines: ReturnLine[], fail?: boolean) =>
    api.request<ReturnRecord>('return.create', { orderId, lines, __fail: fail }),
};

export const InvoiceApi = {
  list: (p: { search?: string; filter?: string } = {}) => api.request<Paged<Invoice>>('invoice.list', p),
  get: (id: number) => api.request<Invoice>('invoice.get', { id }),
  pdf: (id: number) => api.request<{ url: string }>('invoice.pdf', { id }),
};

export const ProfileApi = {
  get: () => api.request<Profile>('profile.get'),
};
