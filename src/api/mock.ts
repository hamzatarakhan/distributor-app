import * as fx from './fixtures';
import i18n from '@/src/i18n';
import type { Transport, Op } from './transport';
import type { Credentials, Session } from './types';

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

function match<T extends { reference?: string; number?: string }>(list: T[], q?: string) {
  if (!q) return list;
  const s = q.toLowerCase();
  return list.filter((x) => JSON.stringify(x).toLowerCase().includes(s));
}

export const mockTransport: Transport = {
  name: 'mock',

  async login(creds: Credentials): Promise<Session> {
    await delay();
    if (!creds.login || !creds.password) throw new Error(i18n.t('common.enterCredentials'));
    return {
      token: 'mock-session',
      uid: 7,
      name: fx.profile.name,
      login: creds.login,
      server: creds.server || 'mock://odoo',
      database: creds.database,
      company: fx.profile.company,
      warehouseIds: [1],
    };
  },

  async logout() {
    await delay(120);
  },

  async request<T>(op: Op, params: Record<string, any> = {}): Promise<T> {
    await delay();
    if (params.__fail) throw new Error(i18n.t('common.simulatedFailure'));

    switch (op) {
      case 'profile.get':
        return fx.profile as T;

      case 'stock.inventory': {
        let items = match(fx.inventory, params.search);
        if (params.lowOnly) items = items.filter((i) => i.reorderPoint != null && i.onHand < i.reorderPoint);
        return { items, total: items.length, hasMore: false } as T;
      }
      case 'stock.product': {
        const p = fx.inventory.find((i) => i.productId === Number(params.productId));
        if (!p) throw new Error(i18n.t('common.productNotFound'));
        return { ...p, moves: fx.movesByProduct[p.productId] ?? [] } as T;
      }
      case 'stock.receipts': {
        let items = fx.receipts;
        if (params.status && params.status !== 'all') items = items.filter((r) => r.status === params.status);
        return { items, total: items.length, hasMore: false } as T;
      }
      case 'stock.receipt': {
        const r = fx.receipts.find((x) => x.id === Number(params.id));
        if (!r) throw new Error(i18n.t('common.receiptNotFound'));
        return r as T;
      }
      case 'stock.receipt.confirm':
        return { reference: `WH/IN/${String(params.id).slice(-4)}`, status: 'done' } as T;

      case 'delivery.list': {
        let items = match(fx.deliveries, params.search);
        if (params.status && params.status !== 'all') items = items.filter((d) => d.status === params.status);
        return { items, total: items.length, hasMore: false } as T;
      }
      case 'delivery.get': {
        const d = fx.deliveries.find((x) => x.id === Number(params.id));
        if (!d) throw new Error(i18n.t('common.deliveryNotFound'));
        return d as T;
      }
      case 'delivery.confirm': {
        const d = fx.deliveries.find((x) => x.id === Number(params.id));
        return { reference: d?.reference ?? 'WH/OUT/????', status: 'done' } as T;
      }

      case 'invoice.list': {
        let items = match(fx.invoices, params.search);
        if (params.filter === 'open') items = items.filter((i) => i.amountDue > 0);
        if (params.filter === 'paid') items = items.filter((i) => i.status === 'paid');
        if (params.filter === 'overdue')
          items = items.filter((i) => i.amountDue > 0 && i.dueDate != null && i.dueDate < today());
        return { items, total: items.length, hasMore: false } as T;
      }
      case 'invoice.get': {
        const inv = fx.invoices.find((x) => x.id === Number(params.id));
        if (!inv) throw new Error(i18n.t('common.invoiceNotFound'));
        return inv as T;
      }
      case 'invoice.pdf':
        return { url: 'https://www.orimi.com/pdf-test.pdf' } as T;

      default:
        throw new Error(`mock: unknown op ${op}`);
    }
  },
};

function today() {
  return new Date().toISOString().slice(0, 10);
}
