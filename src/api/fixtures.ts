import type { Customer, Invoice, Order, Product, Profile, Rep, ReturnRecord, Visit } from './types';

// The rep a mock 'rep' session is scoped to is always reps[0] — see mock.ts login(). A manager
// session sees all of these.
export const reps: Rep[] = [
  { id: 1, name: 'Hamza Tarakhan' },
  { id: 2, name: 'Sami Rep' },
];

export const profile: Profile = {
  name: 'Hamza Tarakhan',
  login: 'hamza',
  email: 'hamza@acme-dist.example',
  phone: '+962 79 000 0000',
  company: 'Acme Distribution',
  warehouses: ['Van #12'],
};

export const products: Product[] = [
  { id: 1, name: 'Cola 330ml Can (24pk)', reference: 'BEV-COLA-24', uom: 'Case', price: 22, currency: 'JOD', vanStock: 40, lowStockThreshold: 10, warehouseStock: 220 },
  { id: 2, name: 'Spring Water 1.5L (6pk)', reference: 'BEV-H2O-6', uom: 'Case', price: 19.5, currency: 'JOD', vanStock: 8, lowStockThreshold: 10, warehouseStock: 60 },
  { id: 3, name: 'Energy Drink 250ml (12pk)', reference: 'BEV-NRG-12', uom: 'Case', price: 32, currency: 'JOD', vanStock: 25, lowStockThreshold: 10, warehouseStock: 140 },
  { id: 4, name: 'Orange Juice 1L (8pk)', reference: 'BEV-OJ-8', uom: 'Case', price: 28, currency: 'JOD', vanStock: 3, lowStockThreshold: 10, warehouseStock: 45 },
  { id: 5, name: 'Sparkling Lemonade 330ml (24pk)', reference: 'BEV-LEM-24', uom: 'Case', price: 24, currency: 'JOD', vanStock: 30, lowStockThreshold: 10, warehouseStock: 180 },
  { id: 6, name: 'Iced Tea Peach 500ml (12pk)', reference: 'BEV-ICT-12', uom: 'Case', price: 21, currency: 'JOD', vanStock: 0, lowStockThreshold: 10, warehouseStock: 90 },
  { id: 7, name: 'Diet Cola 330ml Can (24pk)', reference: 'BEV-DCOLA-24', uom: 'Case', price: 22, currency: 'JOD', vanStock: 18, lowStockThreshold: 10, warehouseStock: 130 },
  { id: 8, name: 'Mineral Water 500ml (12pk)', reference: 'BEV-H2O-12S', uom: 'Case', price: 12, currency: 'JOD', vanStock: 60, lowStockThreshold: 15, warehouseStock: 300 },
  { id: 9, name: 'Mango Nectar 1L (8pk)', reference: 'BEV-MNG-8', uom: 'Case', price: 29, currency: 'JOD', vanStock: 5, lowStockThreshold: 10, warehouseStock: 50 },
  { id: 10, name: 'Sports Drink 500ml (12pk)', reference: 'BEV-SPT-12', uom: 'Case', price: 26, currency: 'JOD', vanStock: 14, lowStockThreshold: 10, warehouseStock: 100 },
];

// Amman coordinates, spread a little so the map/GPS check-in features have something to show.
export const customers: Customer[] = [
  { id: 101, name: 'الوردة الحمراء', currency: 'JOD', creditLimit: 500, balance: 120 },
  { id: 102, name: 'Downtown Mini Market', currency: 'JOD', creditLimit: 300, balance: 280 },
  { id: 103, name: 'Sunrise Supermarket', currency: 'JOD', creditLimit: 1000, balance: 366.56 },
  { id: 104, name: 'Corner Shop 24/7', currency: 'JOD', creditLimit: 200, balance: 111.36 },
];

// "Al-Warda Al-Hamra" is the client's own example customer from the requirements call.
const TODAY = '2026-09-15';

export const visits: Visit[] = [
  {
    id: 1, customerId: 101, customerName: 'الوردة الحمراء', address: '12 Rainbow St, Jabal Amman',
    city: 'Amman', phone: '+962 79 111 2222', date: TODAY, scheduledTime: '09:00', status: 'planned',
    geoLat: 31.9552, geoLng: 35.9106, repId: 1, repName: 'Hamza Tarakhan',
  },
  {
    id: 2, customerId: 102, customerName: 'Downtown Mini Market', address: '5 University Blvd',
    city: 'Amman', phone: '+962 79 333 4444', date: TODAY, scheduledTime: '10:30', status: 'planned',
    geoLat: 31.9633, geoLng: 35.8725, repId: 2, repName: 'Sami Rep',
  },
  {
    id: 3, customerId: 103, customerName: 'Sunrise Supermarket', address: '88 Mecca St',
    city: 'Amman', phone: '+962 78 555 6666', date: TODAY, scheduledTime: '12:00', status: 'done',
    outcome: 'ordered', orderId: 501, geoLat: 31.9497, geoLng: 35.9328, repId: 1, repName: 'Hamza Tarakhan',
  },
  {
    id: 4, customerId: 104, customerName: 'Corner Shop 24/7', address: '3 King Hussein St',
    city: 'Zarqa', phone: '+962 79 777 8888', date: TODAY, scheduledTime: '13:30', status: 'done',
    outcome: 'no_sale', note: 'Overstocked, will check back next week.', geoLat: 32.0728, geoLng: 36.0876,
    repId: 2, repName: 'Sami Rep',
  },
];

export const orders: Order[] = [
  {
    id: 501, reference: 'SO/2026/0501', visitId: 3, customerId: 103, customerName: 'Sunrise Supermarket',
    date: '2026-09-13', status: 'invoiced', currency: 'JOD', invoiceId: 601, hasReturn: false,
    repId: 1, repName: 'Hamza Tarakhan',
    lines: [
      { productId: 1, product: 'Cola 330ml Can (24pk)', uom: 'Case', qty: 10, unitPrice: 22 },
      { productId: 3, product: 'Energy Drink 250ml (12pk)', uom: 'Case', qty: 3, unitPrice: 32 },
    ],
    total: 316,
  },
  {
    id: 502, reference: 'SO/2026/0502', customerId: 104, customerName: 'Corner Shop 24/7',
    date: '2026-08-20', status: 'invoiced', currency: 'JOD', invoiceId: 602, hasReturn: false,
    repId: 2, repName: 'Sami Rep',
    lines: [{ productId: 3, product: 'Energy Drink 250ml (12pk)', uom: 'Case', qty: 3, unitPrice: 32 }],
    total: 96,
  },
  {
    id: 503, reference: 'SO/2026/0503', customerId: 101, customerName: 'الوردة الحمراء',
    date: '2026-08-10', status: 'invoiced', currency: 'JOD', invoiceId: 603, hasReturn: false,
    repId: 1, repName: 'Hamza Tarakhan',
    lines: [{ productId: 1, product: 'Cola 330ml Can (24pk)', uom: 'Case', qty: 20, unitPrice: 24 }],
    total: 480,
  },
  {
    id: 504, reference: 'SO/2026/0504', customerId: 102, customerName: 'Downtown Mini Market',
    date: '2026-09-10', status: 'draft', currency: 'JOD',
    repId: 2, repName: 'Sami Rep',
    lines: [
      { productId: 2, product: 'Spring Water 1.5L (6pk)', uom: 'Case', qty: 4, unitPrice: 19.5 },
      { productId: 8, product: 'Mineral Water 500ml (12pk)', uom: 'Case', qty: 6, unitPrice: 12 },
    ],
    total: 150,
  },
  {
    id: 505, reference: 'SO/2026/0505', customerId: 103, customerName: 'Sunrise Supermarket',
    date: '2026-09-11', status: 'draft', currency: 'JOD',
    repId: 1, repName: 'Hamza Tarakhan',
    lines: [{ productId: 5, product: 'Sparkling Lemonade 330ml (24pk)', uom: 'Case', qty: 8, unitPrice: 24 }],
    total: 192,
  },
  {
    id: 506, reference: 'SO/2026/0506', customerId: 101, customerName: 'الوردة الحمراء',
    date: '2026-09-08', status: 'invoiced', currency: 'JOD', invoiceId: 604, hasReturn: false,
    repId: 1, repName: 'Hamza Tarakhan',
    lines: [
      { productId: 4, product: 'Orange Juice 1L (8pk)', uom: 'Case', qty: 5, unitPrice: 28 },
      { productId: 9, product: 'Mango Nectar 1L (8pk)', uom: 'Case', qty: 3, unitPrice: 29 },
    ],
    total: 227,
  },
];

export const invoices: Invoice[] = [
  {
    id: 601, number: 'INV/2026/0231', orderId: 501, customerId: 103, customerName: 'Sunrise Supermarket',
    invoiceDate: '2026-09-13', dueDate: '2026-09-28', currency: 'JOD',
    amountUntaxed: 316, amountTax: 50.56, amountTotal: 366.56, amountDue: 366.56, status: 'not_paid',
    repId: 1, repName: 'Hamza Tarakhan',
    lines: [
      { id: 1, description: 'Cola 330ml Can (24pk)', qty: 10, unitPrice: 22, subtotal: 220 },
      { id: 2, description: 'Energy Drink 250ml (12pk)', qty: 3, unitPrice: 32, subtotal: 96 },
    ],
  },
  {
    id: 602, number: 'INV/2026/0219', orderId: 502, customerId: 104, customerName: 'Corner Shop 24/7',
    invoiceDate: '2026-08-20', dueDate: '2026-09-04', currency: 'JOD',
    amountUntaxed: 96, amountTax: 15.36, amountTotal: 111.36, amountDue: 111.36, status: 'not_paid',
    repId: 2, repName: 'Sami Rep',
    lines: [{ id: 3, description: 'Energy Drink 250ml (12pk)', qty: 3, unitPrice: 32, subtotal: 96 }],
  },
  {
    id: 603, number: 'INV/2026/0208', orderId: 503, customerId: 101, customerName: 'الوردة الحمراء',
    invoiceDate: '2026-08-10', dueDate: '2026-08-25', currency: 'JOD',
    amountUntaxed: 480, amountTax: 76.8, amountTotal: 556.8, amountDue: 0, status: 'paid',
    repId: 1, repName: 'Hamza Tarakhan',
    lines: [{ id: 4, description: 'Cola 330ml Can (24pk)', qty: 20, unitPrice: 24, subtotal: 480 }],
  },
  {
    id: 604, number: 'INV/2026/0244', orderId: 506, customerId: 101, customerName: 'الوردة الحمراء',
    invoiceDate: '2026-09-08', dueDate: '2026-09-23', currency: 'JOD',
    amountUntaxed: 227, amountTax: 36.32, amountTotal: 263.32, amountDue: 263.32, status: 'not_paid',
    repId: 1, repName: 'Hamza Tarakhan',
    lines: [
      { id: 5, description: 'Orange Juice 1L (8pk)', qty: 5, unitPrice: 28, subtotal: 140 },
      { id: 6, description: 'Mango Nectar 1L (8pk)', qty: 3, unitPrice: 29, subtotal: 87 },
    ],
  },
];

export const returns: ReturnRecord[] = [];
