import type { Credentials, Session } from './types';

// A transport is one way of talking to Odoo. Swap freely: mock / jsonrpc / rest.
// Resource modules (src/api/resources.ts) only ever call `request`.
export interface Transport {
  name: string;
  login(creds: Credentials): Promise<Session>;
  logout(session: Session | null): Promise<void>;
  request<T>(op: Op, params?: Record<string, unknown>): Promise<T>;
}

// Logical operations. Each transport maps these to its own mechanism
// (a fixture, a REST path, or an Odoo model+method+domain).
export type Op =
  | 'profile.get'
  | 'product.list'
  | 'product.get'
  | 'visit.list'
  | 'visit.get'
  | 'visit.confirm'
  | 'order.create'
  | 'order.get'
  | 'order.list'
  | 'order.confirm'
  | 'return.create'
  | 'invoice.list'
  | 'invoice.get'
  | 'invoice.pdf';

export class NotConfiguredError extends Error {
  constructor(transport: string, op: string) {
    super(`${transport} transport has no mapping for "${op}" yet — add it when the endpoint spec lands.`);
    this.name = 'NotConfiguredError';
  }
}
