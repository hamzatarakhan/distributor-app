// Domain types the UI works with. Transports map Odoo's shapes into these.

export type Credentials = { server: string; database?: string; login: string; password: string };

export type Session = {
  token: string; // opaque: session cookie value, bearer token, or mock marker
  uid: number;
  name: string;
  login: string;
  server: string;
  database?: string;
  company?: string;
  warehouseIds?: number[];
};

export type Paged<T> = { items: T[]; total: number; hasMore: boolean };

// ---- Products ---- (sales catalog for building an order, and van-stock reference)
export type Product = {
  id: number;
  name: string;
  reference?: string;
  uom: string;
  price: number;
  currency: string;
  vanStock: number;
};

// ---- Visits ----
export type VisitStatus = 'planned' | 'done' | 'skipped';
export type VisitOutcome = 'no_sale' | 'ordered';

export type Visit = {
  id: number;
  customerId: number;
  customerName: string;
  address?: string;
  city?: string;
  phone?: string;
  scheduledTime?: string;
  status: VisitStatus;
  outcome?: VisitOutcome;
  orderId?: number;
  note?: string;
};

// ---- Orders ----
export type OrderStatus = 'draft' | 'confirmed' | 'invoiced';

export type OrderLine = {
  productId: number;
  product: string;
  uom: string;
  qty: number;
  unitPrice: number;
};

export type Order = {
  id: number;
  reference: string;
  visitId?: number;
  customerId: number;
  customerName: string;
  date: string;
  status: OrderStatus;
  lines: OrderLine[];
  currency: string;
  total: number;
  invoiceId?: number;
  hasReturn?: boolean;
};

// ---- Returns ----
export type ReturnLine = { productId: number; product: string; uom: string; qty: number };

export type ReturnRecord = {
  id: number;
  orderId: number;
  orderReference: string;
  date: string;
  lines: ReturnLine[];
};

// ---- Invoices ----
export type InvoiceStatus = 'draft' | 'not_paid' | 'partial' | 'paid' | 'reversed';

export type InvoiceLine = {
  id: number;
  description: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
};

export type Invoice = {
  id: number;
  number: string;
  orderId?: number;
  customerName: string;
  invoiceDate: string;
  dueDate?: string;
  currency: string;
  amountUntaxed: number;
  amountTax: number;
  amountTotal: number;
  amountDue: number;
  status: InvoiceStatus;
  lines?: InvoiceLine[];
  pdfUrl?: string;
};

export type Profile = {
  name: string;
  login: string;
  email?: string;
  phone?: string;
  company?: string;
  warehouses?: string[];
};
