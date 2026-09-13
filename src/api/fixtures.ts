import type { Customer, Invoice, Order, Product, Profile, ReturnRecord, Visit } from './types';

export const profile: Profile = {
  name: 'Sami Rep',
  login: 'sami',
  email: 'sami@acme-dist.example',
  phone: '+962 79 000 0000',
  company: 'Acme Distribution',
  warehouses: ['Van #12'],
};

export const products: Product[] = [
  { id: 1, name: 'Cola 330ml Can (24pk)', reference: 'BEV-COLA-24', uom: 'Case', price: 22, currency: 'JOD', vanStock: 40, lowStockThreshold: 10 },
  { id: 2, name: 'Spring Water 1.5L (6pk)', reference: 'BEV-H2O-6', uom: 'Case', price: 19.5, currency: 'JOD', vanStock: 8, lowStockThreshold: 10 },
  { id: 3, name: 'Energy Drink 250ml (12pk)', reference: 'BEV-NRG-12', uom: 'Case', price: 32, currency: 'JOD', vanStock: 25, lowStockThreshold: 10 },
  { id: 4, name: 'Orange Juice 1L (8pk)', reference: 'BEV-OJ-8', uom: 'Case', price: 28, currency: 'JOD', vanStock: 3, lowStockThreshold: 10 },
  { id: 5, name: 'Sparkling Lemonade 330ml (24pk)', reference: 'BEV-LEM-24', uom: 'Case', price: 24, currency: 'JOD', vanStock: 30, lowStockThreshold: 10 },
];

// Amman coordinates, spread a little so the map/GPS check-in features have something to show.
export const customers: Customer[] = [
  { id: 101, name: 'الوردة الحمراء', currency: 'JOD', creditLimit: 500, balance: 120 },
  { id: 102, name: 'Downtown Mini Market', currency: 'JOD', creditLimit: 300, balance: 280 },
  { id: 103, name: 'Sunrise Supermarket', currency: 'JOD', creditLimit: 1000, balance: 366.56 },
  { id: 104, name: 'Corner Shop 24/7', currency: 'JOD', creditLimit: 200, balance: 111.36 },
];

// "Al-Warda Al-Hamra" is the client's own example customer from the requirements call.
export const visits: Visit[] = [
  {
    id: 1, customerId: 101, customerName: 'الوردة الحمراء', address: '12 Rainbow St, Jabal Amman',
    city: 'Amman', phone: '+962 79 111 2222', scheduledTime: '09:00', status: 'planned',
    geoLat: 31.9552, geoLng: 35.9106,
  },
  {
    id: 2, customerId: 102, customerName: 'Downtown Mini Market', address: '5 University Blvd',
    city: 'Amman', phone: '+962 79 333 4444', scheduledTime: '10:30', status: 'planned',
    geoLat: 31.9633, geoLng: 35.8725,
  },
  {
    id: 3, customerId: 103, customerName: 'Sunrise Supermarket', address: '88 Mecca St',
    city: 'Amman', phone: '+962 78 555 6666', scheduledTime: '12:00', status: 'done',
    outcome: 'ordered', orderId: 501, geoLat: 31.9497, geoLng: 35.9328,
  },
  {
    id: 4, customerId: 104, customerName: 'Corner Shop 24/7', address: '3 King Hussein St',
    city: 'Zarqa', phone: '+962 79 777 8888', scheduledTime: '13:30', status: 'done',
    outcome: 'no_sale', note: 'Overstocked, will check back next week.', geoLat: 32.0728, geoLng: 36.0876,
  },
];

export const orders: Order[] = [
  {
    id: 501, reference: 'SO/2026/0501', visitId: 3, customerId: 103, customerName: 'Sunrise Supermarket',
    date: '2026-09-13', status: 'invoiced', currency: 'JOD', invoiceId: 601, hasReturn: false,
    lines: [
      { productId: 1, product: 'Cola 330ml Can (24pk)', uom: 'Case', qty: 10, unitPrice: 22 },
      { productId: 3, product: 'Energy Drink 250ml (12pk)', uom: 'Case', qty: 3, unitPrice: 32 },
    ],
    total: 316,
  },
];

export const invoices: Invoice[] = [
  {
    id: 601, number: 'INV/2026/0231', orderId: 501, customerName: 'Sunrise Supermarket',
    invoiceDate: '2026-09-13', dueDate: '2026-09-28', currency: 'JOD',
    amountUntaxed: 316, amountTax: 50.56, amountTotal: 366.56, amountDue: 366.56, status: 'not_paid',
    lines: [
      { id: 1, description: 'Cola 330ml Can (24pk)', qty: 10, unitPrice: 22, subtotal: 220 },
      { id: 2, description: 'Energy Drink 250ml (12pk)', qty: 3, unitPrice: 32, subtotal: 96 },
    ],
  },
  {
    id: 602, number: 'INV/2026/0219', customerName: 'Corner Shop 24/7',
    invoiceDate: '2026-08-20', dueDate: '2026-09-04', currency: 'JOD',
    amountUntaxed: 96, amountTax: 15.36, amountTotal: 111.36, amountDue: 111.36, status: 'not_paid',
    lines: [{ id: 3, description: 'Energy Drink 250ml (12pk)', qty: 3, unitPrice: 32, subtotal: 96 }],
  },
  {
    id: 603, number: 'INV/2026/0208', customerName: 'الوردة الحمراء',
    invoiceDate: '2026-08-10', dueDate: '2026-08-25', currency: 'JOD',
    amountUntaxed: 480, amountTax: 76.8, amountTotal: 556.8, amountDue: 0, status: 'paid',
    lines: [{ id: 4, description: 'Cola 330ml Can (24pk)', qty: 20, unitPrice: 24, subtotal: 480 }],
  },
];

export const returns: ReturnRecord[] = [];
