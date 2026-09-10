import { NotConfiguredError, type Op, type Transport } from './transport';
import type { Credentials, Session } from './types';

// Standard Odoo JSON-RPC transport. Fill in the model/method/domain mapping
// per-op as we confirm the Odoo side. Until then every op throws NotConfiguredError.

// Odoo web session auth: POST {server}/web/session/authenticate
//   { jsonrpc:"2.0", params:{ db, login, password } }  -> sets session cookie, returns uid
// Model calls: POST {server}/web/dataset/call_kw
//   { jsonrpc:"2.0", params:{ model, method, args, kwargs } }

async function rpc(server: string, path: string, params: unknown) {
  const res = await fetch(`${server}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error?.data?.message || json.error.message || 'Odoo error');
  return json.result;
}

export const jsonRpcTransport: Transport = {
  name: 'jsonrpc',

  async login(creds: Credentials): Promise<Session> {
    const result = await rpc(creds.server, '/web/session/authenticate', {
      db: creds.database,
      login: creds.login,
      password: creds.password,
    });
    if (!result?.uid) throw new Error('Invalid credentials');
    return {
      token: result.session_id ?? 'cookie',
      uid: result.uid,
      name: result.name ?? creds.login,
      login: creds.login,
      server: creds.server,
      database: creds.database,
      company: result.company_id?.[1],
      // TODO: fetch the distributor's warehouse(s) once the Odoo model is confirmed
    };
  },

  async logout(session) {
    if (session) await rpc(session.server, '/web/session/destroy', {}).catch(() => {});
  },

  async request<T>(op: Op, _params?: Record<string, unknown>): Promise<T> {
    // TODO per-op: map to /web/dataset/call_kw with { model, method:'search_read', args:[domain, fields], kwargs }
    throw new NotConfiguredError('jsonrpc', op);
  },
};
