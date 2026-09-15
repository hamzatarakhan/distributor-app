import { NotConfiguredError, type Op, type Transport } from './transport';
import type { Credentials, Session } from './types';

// Custom Odoo REST module transport. Fill ENDPOINTS as Hamza provides the specs.
// Each entry: [httpMethod, pathTemplate]. `:x` segments are filled from params.

type Endpoint = { method: 'GET' | 'POST'; path: string };

const ENDPOINTS: Partial<Record<Op, Endpoint>> = {
  // 'visit.list':           { method: 'GET',  path: '/api/v1/visits' },
  // 'visit.confirm':        { method: 'POST', path: '/api/v1/visits/:id/confirm' },
  // 'order.create':         { method: 'POST', path: '/api/v1/orders' },
  // 'order.confirm':        { method: 'POST', path: '/api/v1/orders/:id/confirm' },
  // 'invoice.list':         { method: 'GET',  path: '/api/v1/invoices' },
};

let bearer: string | null = null;

function fill(path: string, params: Record<string, any>) {
  return path.replace(/:(\w+)/g, (_, k) => encodeURIComponent(params[k]));
}

export const restTransport: Transport = {
  name: 'rest',

  async login(creds: Credentials): Promise<Session> {
    // TODO: confirm the auth endpoint + payload shape
    const res = await fetch(`${creds.server}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: creds.login, password: creds.password, db: creds.database }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const json = await res.json();
    bearer = json.token;
    return {
      token: json.token,
      uid: json.uid ?? 0,
      name: json.name ?? creds.login,
      login: creds.login,
      server: creds.server,
      database: creds.database,
      company: json.company,
      warehouseIds: json.warehouse_ids,
      role: creds.role,
    };
  },

  async logout() {
    bearer = null;
  },

  async request<T>(op: Op, params: Record<string, any> = {}): Promise<T> {
    const ep = ENDPOINTS[op];
    if (!ep) throw new NotConfiguredError('rest', op);
    const base = params.__server as string;
    const url = new URL(base + fill(ep.path, params));
    let body: string | undefined;
    if (ep.method === 'GET') {
      for (const [k, v] of Object.entries(params)) {
        if (!k.startsWith('__') && !ep.path.includes(`:${k}`) && v != null) url.searchParams.set(k, String(v));
      }
    } else {
      body = JSON.stringify(params);
    }
    const res = await fetch(url.toString(), {
      method: ep.method,
      headers: {
        'Content-Type': 'application/json',
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
      body,
    });
    if (!res.ok) throw new Error(`${op} failed (${res.status})`);
    return (await res.json()) as T;
  },
};

export function setRestToken(t: string | null) {
  bearer = t;
}
