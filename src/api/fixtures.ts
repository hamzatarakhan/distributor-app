import type { Invoice, InventoryItem, Picking, Profile, StockMove } from './types';

export const profile: Profile = {
  name: 'Sami Distributor',
  login: 'sami',
  email: 'sami@acme-dist.example',
  phone: '+962 79 000 0000',
  company: 'Acme Distribution',
  warehouses: ['Amman Central WH'],
};

export const inventory: InventoryItem[] = [
  {
    productId: 1, name: 'Cola 330ml Can (24pk)', reference: 'BEV-COLA-24', uom: 'Case',
    onHand: 128, forecasted: 96, reserved: 32, incoming: 40, outgoing: 72, reorderPoint: 60,
    locationName: 'WH/Stock',
    byLocation: [{ location: 'WH/Stock', qty: 110 }, { location: 'WH/Van-01', qty: 18 }],
  },
  {
    productId: 2, name: 'Spring Water 1.5L (6pk)', reference: 'BEV-H2O-6', uom: 'Case',
    onHand: 12, forecasted: -8, reserved: 20, incoming: 0, outgoing: 20, reorderPoint: 40,
    locationName: 'WH/Stock',
    byLocation: [{ location: 'WH/Stock', qty: 12 }],
  },
  {
    productId: 3, name: 'Energy Drink 250ml (12pk)', reference: 'BEV-NRG-12', uom: 'Case',
    onHand: 64, forecasted: 64, reserved: 0, incoming: 0, outgoing: 0, reorderPoint: 24,
    locationName: 'WH/Stock',
  },
  {
    productId: 4, name: 'Orange Juice 1L (8pk)', reference: 'BEV-OJ-8', uom: 'Case',
    onHand: -3, forecasted: -3, reserved: 0, incoming: 24, outgoing: 0, reorderPoint: 30,
    locationName: 'WH/Stock',
  },
];

export const movesByProduct: Record<number, StockMove[]> = {
  1: [
    { id: 11, date: '2026-09-08', from: 'Vendor', to: 'WH/Stock', qty: 40, uom: 'Case', reference: 'WH/IN/0042' },
    { id: 12, date: '2026-09-09', from: 'WH/Stock', to: 'Customer', qty: -12, uom: 'Case', reference: 'WH/OUT/0088' },
  ],
};

export const receipts: Picking[] = [
  {
    id: 101, reference: 'WH/IN/0042', kind: 'incoming', partnerName: 'Beverage Supplier Co',
    sourceDocument: 'PO00123', scheduledDate: '2026-09-11', status: 'ready', itemCount: 2,
    lines: [
      { id: 1, productId: 1, product: 'Cola 330ml Can (24pk)', demandQty: 40, doneQty: 40, uom: 'Case' },
      { id: 2, productId: 3, product: 'Energy Drink 250ml (12pk)', demandQty: 10, doneQty: 10, uom: 'Case' },
    ],
  },
  {
    id: 102, reference: 'WH/IN/0043', kind: 'incoming', partnerName: 'Juice Farm Ltd',
    sourceDocument: 'PO00124', scheduledDate: '2026-09-13', status: 'waiting', itemCount: 1,
    lines: [{ id: 3, productId: 4, product: 'Orange Juice 1L (8pk)', demandQty: 24, doneQty: 24, uom: 'Case' }],
  },
];

export const deliveries: Picking[] = [
  {
    id: 201, reference: 'WH/OUT/0088', kind: 'outgoing', partnerName: 'Downtown Mini Market',
    sourceDocument: 'SO00567', scheduledDate: '2026-09-10', status: 'ready', itemCount: 3,
    deliveryAddress: '12 Rainbow St, Jabal Amman', deliveryCity: 'Amman',
    phone: '+962 79 111 2222', saleOrderRef: 'SO00567',
    lines: [
      { id: 1, productId: 1, product: 'Cola 330ml Can (24pk)', demandQty: 6, doneQty: 6, uom: 'Case' },
      { id: 2, productId: 2, product: 'Spring Water 1.5L (6pk)', demandQty: 4, doneQty: 4, uom: 'Case' },
      { id: 3, productId: 3, product: 'Energy Drink 250ml (12pk)', demandQty: 2, doneQty: 2, uom: 'Case' },
    ],
  },
  {
    id: 202, reference: 'WH/OUT/0089', kind: 'outgoing', partnerName: 'Sunrise Supermarket',
    sourceDocument: 'SO00568', scheduledDate: '2026-09-10', status: 'ready', itemCount: 1,
    deliveryAddress: '5 University Blvd', deliveryCity: 'Irbid',
    phone: '+962 78 333 4444', saleOrderRef: 'SO00568',
    lines: [{ id: 4, productId: 1, product: 'Cola 330ml Can (24pk)', demandQty: 10, doneQty: 10, uom: 'Case' }],
  },
  {
    id: 203, reference: 'WH/OUT/0087', kind: 'outgoing', partnerName: 'Corner Shop 24/7',
    sourceDocument: 'SO00561', scheduledDate: '2026-09-09', status: 'done', itemCount: 2,
    deliveryAddress: '88 Mecca St', deliveryCity: 'Amman',
    phone: '+962 79 555 6666', saleOrderRef: 'SO00561',
    lines: [
      { id: 5, productId: 2, product: 'Spring Water 1.5L (6pk)', demandQty: 8, doneQty: 8, uom: 'Case' },
      { id: 6, productId: 3, product: 'Energy Drink 250ml (12pk)', demandQty: 3, doneQty: 3, uom: 'Case' },
    ],
  },
];

export const invoices: Invoice[] = [
  {
    id: 301, number: 'INV/2026/0231', customerName: 'Downtown Mini Market',
    invoiceDate: '2026-09-01', dueDate: '2026-09-16', currency: 'JOD',
    amountUntaxed: 210, amountTax: 33.6, amountTotal: 243.6, amountDue: 243.6, status: 'not_paid',
    lines: [
      { id: 1, description: 'Cola 330ml Can (24pk)', qty: 6, unitPrice: 22, subtotal: 132 },
      { id: 2, description: 'Spring Water 1.5L (6pk)', qty: 4, unitPrice: 19.5, subtotal: 78 },
    ],
  },
  {
    id: 302, number: 'INV/2026/0219', customerName: 'Corner Shop 24/7',
    invoiceDate: '2026-08-20', dueDate: '2026-09-04', currency: 'JOD',
    amountUntaxed: 96, amountTax: 15.36, amountTotal: 111.36, amountDue: 111.36, status: 'not_paid',
    lines: [{ id: 3, description: 'Energy Drink 250ml (12pk)', qty: 3, unitPrice: 32, subtotal: 96 }],
  },
  {
    id: 303, number: 'INV/2026/0208', customerName: 'Sunrise Supermarket',
    invoiceDate: '2026-08-10', dueDate: '2026-08-25', currency: 'JOD',
    amountUntaxed: 480, amountTax: 76.8, amountTotal: 556.8, amountDue: 0, status: 'paid',
    lines: [{ id: 4, description: 'Cola 330ml Can (24pk)', qty: 20, unitPrice: 24, subtotal: 480 }],
  },
];
