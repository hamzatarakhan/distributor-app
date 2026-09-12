import * as fx from './fixtures';
import type { Transport, Op } from './transport';
import type { Credentials, Invoice, Order, OrderLine, Session, Visit } from './types';

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

function match<T>(list: T[], q?: string) {
  if (!q) return list;
  const s = q.toLowerCase();
  return list.filter((x) => JSON.stringify(x).toLowerCase().includes(s));
}

// In-memory state so a visit confirmed / order created / return filed in this app session shows
// up right away elsewhere (Orders list, invoice list, the visit's own status). Resets on reload —
// it's a mock, not a database; the real transports write through to Odoo instead.
let visits = fx.visits.map((v) => ({ ...v }));
let orders = fx.orders.map((o) => ({ ...o, lines: o.lines.map((l) => ({ ...l })) }));
let invoices = fx.invoices.map((i) => ({ ...i }));
let nextOrderId = Math.max(0, ...orders.map((o) => o.id)) + 1;
let nextInvoiceId = Math.max(0, ...invoices.map((i) => i.id)) + 1;
let nextReturnId = 1;

export const mockTransport: Transport = {
  name: 'mock',

  async login(creds: Credentials): Promise<Session> {
    await delay();
    if (!creds.login || !creds.password) throw new Error('Enter your username and password.');
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
    if (params.__fail) throw new Error('Simulated failure (remove __fail to succeed).');

    switch (op) {
      case 'profile.get':
        return fx.profile as T;

      case 'product.list': {
        const items = match(fx.products, params.search);
        return { items, total: items.length, hasMore: false } as T;
      }
      case 'product.get': {
        const p = fx.products.find((x) => x.id === Number(params.id));
        if (!p) throw new Error('Product not found');
        return p as T;
      }

      case 'visit.list': {
        let items = match(visits, params.search);
        if (params.status && params.status !== 'all') items = items.filter((v) => v.status === params.status);
        return { items, total: items.length, hasMore: false } as T;
      }
      case 'visit.get': {
        const v = visits.find((x) => x.id === Number(params.id));
        if (!v) throw new Error('Visit not found');
        return v as T;
      }
      case 'visit.confirm': {
        const v = visits.find((x) => x.id === Number(params.id));
        if (!v) throw new Error('Visit not found');
        const updated: Visit = { ...v, status: 'done', outcome: params.outcome, note: params.note };
        visits = visits.map((x) => (x.id === v.id ? updated : x));
        return updated as T;
      }

      case 'order.list': {
        let items = match(orders, params.search);
        if (params.hasReturn === true) items = items.filter((o) => !o.hasReturn && o.status !== 'draft');
        return { items, total: items.length, hasMore: false } as T;
      }
      case 'order.get': {
        const o = orders.find((x) => x.id === Number(params.id));
        if (!o) throw new Error('Order not found');
        return o as T;
      }
      case 'order.create': {
        const lines = (params.lines as OrderLine[]) ?? [];
        const total = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
        const order: Order = {
          id: nextOrderId++,
          reference: `SO/2026/${String(500 + nextOrderId).padStart(4, '0')}`,
          visitId: params.visitId,
          customerId: params.customerId,
          customerName: params.customerName,
          date: new Date().toISOString().slice(0, 10),
          status: 'draft',
          currency: 'JOD',
          lines,
          total,
        };
        orders = [order, ...orders];
        if (params.visitId) {
          visits = visits.map((v) =>
            v.id === params.visitId ? { ...v, status: 'done', outcome: 'ordered', orderId: order.id } : v,
          );
        }
        return order as T;
      }
      case 'order.confirm': {
        const order = orders.find((x) => x.id === Number(params.id));
        if (!order) throw new Error('Order not found');
        // Confirming an order is the "stock-out" moment: it deducts van stock and creates the
        // invoice in one step, matching how the rep experiences it in the field.
        const invoice: Invoice = {
          id: nextInvoiceId++,
          number: `INV/2026/${String(200 + nextInvoiceId).padStart(4, '0')}`,
          orderId: order.id,
          customerName: order.customerName,
          invoiceDate: order.date,
          dueDate: order.date,
          currency: order.currency,
          amountUntaxed: order.total,
          amountTax: Math.round(order.total * 0.16 * 100) / 100,
          amountTotal: Math.round(order.total * 1.16 * 100) / 100,
          amountDue: Math.round(order.total * 1.16 * 100) / 100,
          status: 'not_paid',
          lines: order.lines.map((l, i) => ({
            id: i + 1,
            description: l.product,
            qty: l.qty,
            unitPrice: l.unitPrice,
            subtotal: l.qty * l.unitPrice,
          })),
        };
        invoices = [invoice, ...invoices];
        const updated: Order = { ...order, status: 'invoiced', invoiceId: invoice.id };
        orders = orders.map((x) => (x.id === order.id ? updated : x));
        return { order: updated, invoice } as T;
      }

      case 'return.create': {
        const order = orders.find((x) => x.id === Number(params.orderId));
        if (!order) throw new Error('Order not found');
        const record = {
          id: nextReturnId++,
          orderId: order.id,
          orderReference: order.reference,
          date: new Date().toISOString().slice(0, 10),
          lines: params.lines,
        };
        orders = orders.map((x) => (x.id === order.id ? { ...x, hasReturn: true } : x));
        return record as T;
      }

      case 'invoice.list': {
        let items = match(invoices, params.search);
        if (params.filter === 'open') items = items.filter((i) => i.amountDue > 0);
        if (params.filter === 'paid') items = items.filter((i) => i.status === 'paid');
        if (params.filter === 'overdue')
          items = items.filter((i) => i.amountDue > 0 && i.dueDate != null && i.dueDate < today());
        return { items, total: items.length, hasMore: false } as T;
      }
      case 'invoice.get': {
        const inv = invoices.find((x) => x.id === Number(params.id));
        if (!inv) throw new Error('Invoice not found');
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
