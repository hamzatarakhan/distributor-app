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

// ---- Stock ----
export type InventoryItem = {
  productId: number;
  name: string;
  reference?: string;
  uom: string;
  onHand: number;
  forecasted: number;
  reserved: number;
  incoming: number;
  outgoing: number;
  reorderPoint?: number;
  locationName?: string;
  byLocation?: { location: string; qty: number }[];
  imageUrl?: string;
};

export type StockMove = {
  id: number;
  date: string;
  from: string;
  to: string;
  qty: number;
  uom: string;
  reference?: string;
};

export type PickingStatus = 'draft' | 'waiting' | 'ready' | 'done' | 'cancel';

export type PickingLine = {
  id: number;
  productId: number;
  product: string;
  demandQty: number;
  doneQty: number;
  uom: string;
};

export type Picking = {
  id: number;
  reference: string;
  kind: 'incoming' | 'outgoing';
  partnerName?: string;
  sourceDocument?: string;
  scheduledDate?: string;
  status: PickingStatus;
  itemCount: number;
  lines?: PickingLine[];
  // delivery-specific
  deliveryAddress?: string;
  deliveryCity?: string;
  phone?: string;
  saleOrderRef?: string;
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
