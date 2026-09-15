// Domain types the UI works with. Transports map Odoo's shapes into these.

// A manager assigns visits to reps and sees everyone's activity; a rep sees only their own —
// enforced by the mock transport filtering `visit.list` by `repId`, the same way a real backend
// would enforce it with a row-level security rule keyed off this same role/repId pair.
export type Role = 'rep' | 'manager';

export type Credentials = { server: string; database?: string; login: string; password: string; role: Role };

export type Session = {
  token: string; // opaque: session cookie value, bearer token, or mock marker
  uid: number;
  name: string;
  login: string;
  server: string;
  database?: string;
  company?: string;
  warehouseIds?: number[];
  role: Role;
  repId?: number; // set when role === 'rep' — which rep's visits this session is scoped to
};

export type Rep = { id: number; name: string };

export type Paged<T> = { items: T[]; total: number; hasMore: boolean };

// ---- Products ---- (sales catalog for building an order, and van-stock reference)
// lowStockThreshold: Phase 2 — below this, the product is flagged low in the van.
export type Product = {
  id: number;
  name: string;
  reference?: string;
  uom: string;
  price: number;
  currency: string;
  vanStock: number;
  lowStockThreshold?: number;
};

// ---- Customers ---- (Phase 2 — balance / credit-limit check before selling more)
export type Customer = {
  id: number;
  name: string;
  currency: string;
  creditLimit: number;
  balance: number; // total outstanding across open invoices
};

// ---- Visits ----
export type VisitStatus = 'planned' | 'done' | 'skipped';
export type VisitOutcome = 'no_sale' | 'ordered';

// geoLat/geoLng: the customer's known location, for Phase 2 GPS check-in distance comparison.
// checkIn/photoUri: captured when the visit is confirmed, Phase 2 only.
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
  geoLat?: number;
  geoLng?: number;
  checkIn?: { lat: number; lng: number; distanceMeters: number; at: string };
  photoUri?: string;
  repId?: number;
  repName?: string;
};

// ---- Orders ----
export type OrderStatus = 'draft' | 'confirmed' | 'invoiced';

// discountPercent: Phase 2 — a per-line discount applied in the order builder.
export type OrderLine = {
  productId: number;
  product: string;
  uom: string;
  qty: number;
  unitPrice: number;
  discountPercent?: number;
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
  signature?: string[]; // SVG path strings — Phase 2 proof-of-delivery, captured at confirm time
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

// payments: Phase 2 — cash/cheque collection recorded against this invoice.
export type PaymentMethod = 'cash' | 'cheque';
export type Payment = { id: number; method: PaymentMethod; amount: number; date: string };

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
  payments?: Payment[];
};

export type Profile = {
  name: string;
  login: string;
  email?: string;
  phone?: string;
  company?: string;
  warehouses?: string[];
};
