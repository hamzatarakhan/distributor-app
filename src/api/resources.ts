import { api } from './index';
import type {
  Customer, Invoice, Order, OrderLine, OrderStatus, Paged, PaymentMethod, Product, Profile, ReturnLine,
  ReturnRecord, Visit, VisitOutcome,
} from './types';

export const ProductApi = {
  list: (p: { search?: string; stockFilter?: 'all' | 'low' | 'out' } = {}) => api.request<Paged<Product>>('product.list', p),
  get: (id: number) => api.request<Product>('product.get', { id }),
};

export const CustomerApi = {
  get: (id: number) => api.request<Customer>('customer.get', { id }),
};

export const VisitApi = {
  list: (p: { search?: string; status?: string } = {}) => api.request<Paged<Visit>>('visit.list', p),
  get: (id: number) => api.request<Visit>('visit.get', { id }),
  confirm: (
    id: number,
    outcome: VisitOutcome,
    extra: { note?: string; photoUri?: string; fail?: boolean } = {},
  ) => api.request<Visit>('visit.confirm', { id, outcome, ...extra, __fail: extra.fail }),
  checkin: (id: number, checkIn: NonNullable<Visit['checkIn']>, photoUri?: string, fail?: boolean) =>
    api.request<Visit>('visit.checkin', { id, checkIn, photoUri, __fail: fail }),
};

export const OrderApi = {
  list: (p: { search?: string; hasReturn?: boolean; status?: 'all' | OrderStatus } = {}) => api.request<Paged<Order>>('order.list', p),
  get: (id: number) => api.request<Order>('order.get', { id }),
  create: (
    v: { visitId?: number; customerId: number; customerName: string; lines: OrderLine[] },
    fail?: boolean,
  ) => api.request<Order>('order.create', { ...v, __fail: fail }),
  confirm: (id: number, signature?: string[], fail?: boolean) =>
    api.request<{ order: Order; invoice: Invoice }>('order.confirm', { id, signature, __fail: fail }),
};

export const ReturnApi = {
  create: (orderId: number, lines: ReturnLine[], fail?: boolean) =>
    api.request<ReturnRecord>('return.create', { orderId, lines, __fail: fail }),
};

export const InvoiceApi = {
  list: (p: { search?: string; filter?: string } = {}) => api.request<Paged<Invoice>>('invoice.list', p),
  get: (id: number) => api.request<Invoice>('invoice.get', { id }),
  pdf: (id: number) => api.request<{ url: string }>('invoice.pdf', { id }),
  recordPayment: (id: number, method: PaymentMethod, amount: number, fail?: boolean) =>
    api.request<Invoice>('invoice.recordPayment', { id, method, amount, __fail: fail }),
};

export const ProfileApi = {
  get: () => api.request<Profile>('profile.get'),
};
