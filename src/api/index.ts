import { jsonRpcTransport } from './jsonrpc';
import { mockTransport } from './mock';
import { restTransport } from './rest';
import type { Op, Transport } from './transport';
import type { Credentials, Session } from './types';

const TRANSPORTS: Record<string, Transport> = {
  mock: mockTransport,
  jsonrpc: jsonRpcTransport,
  rest: restTransport,
};

// Default transport. Flip via app.json > expo.extra.apiTransport or EXPO_PUBLIC_API_TRANSPORT.
const DEFAULT =
  process.env.EXPO_PUBLIC_API_TRANSPORT ||
  // @ts-ignore - Constants at runtime; keep the import light
  'mock';

// Per-op override — point one resource at a real transport while the rest stay mock.
// e.g. { 'invoice.list': 'rest', 'invoice.get': 'rest' }
const OVERRIDES: Partial<Record<Op, string>> = {};

function pick(op?: Op): Transport {
  const key = (op && OVERRIDES[op]) || DEFAULT;
  return TRANSPORTS[key] ?? mockTransport;
}

let session: Session | null = null;
export function setActiveSession(s: Session | null) {
  session = s;
}
export function getActiveSession() {
  return session;
}

export const api = {
  transportName: () => pick().name,

  login(creds: Credentials) {
    return pick().login(creds);
  },
  logout() {
    return pick().logout(session);
  },
  request<T>(op: Op, params: Record<string, unknown> = {}) {
    return pick(op).request<T>(op, {
      ...params,
      __server: session?.server,
      __db: session?.database,
      __role: session?.role,
      __repId: session?.repId,
    });
  },
};

export type { Op } from './transport';
export * from './types';
