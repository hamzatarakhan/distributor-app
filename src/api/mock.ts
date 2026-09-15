import * as fx from './fixtures';
import { lineTotal, orderTotal } from '@/src/lib/orderMath';
import type { Transport, Op } from './transport';
import type { Credentials, Customer, Invoice, Order, OrderLine, Payment, Session, Visit } from './types';

// A rep-role mock session is always scoped to the first fixture rep — there's no real user
// directory to pick from in a mock. A manager session isn't scoped to any single rep.
const DEMO_REP_ID = fx.reps[0].id;

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

function match<T>(list: T[], q?: string) {
  if (!q) return list;
  const s = q.toLowerCase();
  return list.filter((x) => JSON.stringify(x).toLowerCase().includes(s));
}

// In-memory state so a visit confirmed / order created / return filed in this app session shows
// up right away elsewhere (Orders list, invoice list, the visit's own status). Resets on reload —
// it's a mock, not a database; the real transports write through to Odoo instead.
let visits: Visit[] = fx.visits.map((v) => ({ ...v }));
let orders: Order[] = fx.orders.map((o) => ({ ...o, lines: o.lines.map((l) => ({ ...l })) }));
let invoices: Invoice[] = fx.invoices.map((i) => ({ ...i, payments: [...(i.payments ?? [])] }));
let customers: Customer[] = fx.customers.map((c) => ({ ...c }));
let nextPaymentId = 1;
let nextOrderId = Math.max(0, ...orders.map((o) => o.id)) + 1;
let nextInvoiceId = Math.max(0, ...invoices.map((i) => i.id)) + 1;
let nextReturnId = 1;
let nextVisitId = Math.max(0, ...visits.map((v) => v.id)) + 1;

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
      role: creds.role,
      repId: creds.role === 'rep' ? DEMO_REP_ID : undefined,
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
        let items = match(fx.products, params.search);
        if (params.stockFilter === 'out') items = items.filter((p) => p.vanStock <= 0);
        if (params.stockFilter === 'low') items = items.filter((p) => p.lowStockThreshold != null && p.vanStock > 0 && p.vanStock <= p.lowStockThreshold);
        return { items, total: items.length, hasMore: false } as T;
      }
      case 'product.get': {
        const p = fx.products.find((x) => x.id === Number(params.id));
        if (!p) throw new Error('Product not found');
        return p as T;
      }

      case 'customer.list':
        return { items: customers, total: customers.length, hasMore: false } as T;

      case 'customer.get': {
        const c = customers.find((x) => x.id === Number(params.id));
        if (!c) throw new Error('Customer not found');
        return c as T;
      }

      case 'visit.list': {
        let items = match(visits, params.search);
        if (params.status && params.status !== 'all') items = items.filter((v) => v.status === params.status);
        // A rep only ever sees visits assigned to them, and only *today's* — matching the
        // client's own "today's visit list" requirement. A real backend would enforce the rep
        // scoping as a row-level security rule; the date scoping is just "what day is it".
        // A manager sees every rep's visits across every day, for full schedule oversight.
        if (params.__role === 'rep') {
          items = items.filter((v) => v.repId === params.__repId && (v.date ?? today()) === today());
        }
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
        const updated: Visit = {
          ...v,
          status: 'done',
          outcome: params.outcome,
          note: params.note,
          photoUri: params.photoUri ?? v.photoUri,
        };
        visits = visits.map((x) => (x.id === v.id ? updated : x));
        return updated as T;
      }
      case 'visit.checkin': {
        const v = visits.find((x) => x.id === Number(params.id));
        if (!v) throw new Error('Visit not found');
        const updated: Visit = { ...v, checkIn: params.checkIn, photoUri: params.photoUri ?? v.photoUri };
        visits = visits.map((x) => (x.id === v.id ? updated : x));
        return updated as T;
      }
      case 'visit.create': {
        const rep = fx.reps.find((r) => r.id === Number(params.repId));
        if (!rep) throw new Error('Rep not found');
        const customer = customers.find((c) => c.id === Number(params.customerId));
        if (!customer) throw new Error('Customer not found');
        const created: Visit = {
          id: nextVisitId++,
          customerId: customer.id,
          customerName: customer.name,
          date: params.date || today(),
          scheduledTime: params.scheduledTime,
          status: 'planned',
          repId: rep.id,
          repName: rep.name,
        };
        visits = [...visits, created];
        return created as T;
      }

      case 'rep.list':
        return { items: fx.reps, total: fx.reps.length, hasMore: false } as T;

      case 'stock.issue': {
        const p = fx.products.find((x) => x.id === Number(params.productId));
        if (!p) throw new Error('Product not found');
        const qty = Number(params.qty);
        if (!qty || qty <= 0) throw new Error('Enter a quantity greater than 0.');
        if ((p.warehouseStock ?? 0) < qty) throw new Error('Not enough warehouse stock.');
        // ponytail: one shared vanStock number stands in for "the rep's van" — there's no
        // per-rep van in this data model yet. Issuing stock always tops up that single number;
        // real per-rep van inventories would need vanStock to move onto a rep-keyed table.
        p.warehouseStock = (p.warehouseStock ?? 0) - qty;
        p.vanStock = p.vanStock + qty;
        return p as T;
      }

      case 'order.list': {
        let items = match(orders, params.search);
        if (params.hasReturn === true) items = items.filter((o) => !o.hasReturn && o.status !== 'draft');
        if (params.status && params.status !== 'all') items = items.filter((o) => o.status === params.status);
        return { items, total: items.length, hasMore: false } as T;
      }
      case 'order.get': {
        const o = orders.find((x) => x.id === Number(params.id));
        if (!o) throw new Error('Order not found');
        return o as T;
      }
      case 'order.create': {
        const lines = (params.lines as OrderLine[]) ?? [];
        const total = orderTotal(lines);
        // The order is built by whichever rep is signed in — __role/__repId come from the active
        // session (see api/index.ts), same as the visit.list scoping above.
        const rep = fx.reps.find((r) => r.id === params.__repId);
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
          repId: rep?.id,
          repName: rep?.name,
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
        const found = orders.find((x) => x.id === Number(params.id));
        if (!found) throw new Error('Order not found');
        const order: Order = params.signature ? { ...found, signature: params.signature } : found;
        // Confirming an order is the "stock-out" moment: it deducts van stock and creates the
        // invoice in one step, matching how the rep experiences it in the field.
        const invoice: Invoice = {
          id: nextInvoiceId++,
          number: `INV/2026/${String(200 + nextInvoiceId).padStart(4, '0')}`,
          orderId: order.id,
          customerId: order.customerId,
          customerName: order.customerName,
          invoiceDate: order.date,
          dueDate: order.date,
          currency: order.currency,
          amountUntaxed: order.total,
          amountTax: Math.round(order.total * 0.16 * 100) / 100,
          amountTotal: Math.round(order.total * 1.16 * 100) / 100,
          amountDue: Math.round(order.total * 1.16 * 100) / 100,
          status: 'not_paid',
          repId: order.repId,
          repName: order.repName,
          lines: order.lines.map((l, i) => ({
            id: i + 1,
            description: l.discountPercent ? `${l.product} (-${l.discountPercent}%)` : l.product,
            qty: l.qty,
            unitPrice: l.unitPrice,
            subtotal: Math.round(lineTotal(l) * 100) / 100,
          })),
          payments: [],
        };
        invoices = [invoice, ...invoices];
        customers = customers.map((c) =>
          c.id === order.customerId ? { ...c, balance: c.balance + invoice.amountTotal } : c,
        );
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

      case 'invoice.recordPayment': {
        const inv = invoices.find((x) => x.id === Number(params.id));
        if (!inv) throw new Error('Invoice not found');
        const payment: Payment = {
          id: nextPaymentId++,
          method: params.method,
          amount: Number(params.amount),
          date: today(),
        };
        const amountDue = Math.max(0, Math.round((inv.amountDue - payment.amount) * 100) / 100);
        const updated: Invoice = {
          ...inv,
          amountDue,
          status: amountDue === 0 ? 'paid' : 'partial',
          payments: [...(inv.payments ?? []), payment],
        };
        invoices = invoices.map((x) => (x.id === inv.id ? updated : x));
        // Recording a payment also relieves the customer's outstanding balance for the credit
        // check on the Visit/New order screens.
        const custName = inv.customerName;
        customers = customers.map((c) =>
          c.name === custName ? { ...c, balance: Math.max(0, c.balance - payment.amount) } : c,
        );
        return updated as T;
      }

      default:
        throw new Error(`mock: unknown op ${op}`);
    }
  },
};

function today() {
  return new Date().toISOString().slice(0, 10);
}
