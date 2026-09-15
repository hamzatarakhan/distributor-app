import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setActiveSession } from '@/src/api';
import type { Credentials, Role, Session } from '@/src/api';

const SESSION_KEY = 'auth.session.v1';
const SERVER_KEY = 'auth.server.v1';

type AuthValue = {
  session: Session | null;
  ready: boolean;
  server: string;
  database?: string;
  setServer: (server: string, database?: string) => Promise<void>;
  signIn: (login: string, password: string, role: Role) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [server, setServerState] = useState('');
  const [database, setDatabase] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        const rawServer = await SecureStore.getItemAsync(SERVER_KEY);
        if (rawServer) {
          const parsed = JSON.parse(rawServer);
          setServerState(parsed.server ?? '');
          setDatabase(parsed.database);
        }
        const raw = await SecureStore.getItemAsync(SESSION_KEY);
        if (raw) {
          const s: Session = JSON.parse(raw);
          setSession(s);
          setActiveSession(s);
        }
      } catch {
        // corrupt / unavailable store — start signed out
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setServer = async (s: string, db?: string) => {
    setServerState(s);
    setDatabase(db);
    await SecureStore.setItemAsync(SERVER_KEY, JSON.stringify({ server: s, database: db }));
  };

  const signIn = async (login: string, password: string, role: Role) => {
    const creds: Credentials = { server, database, login, password, role };
    const s = await api.login(creds);
    setActiveSession(s);
    setSession(s);
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(s));
  };

  const signOut = async () => {
    try {
      await api.logout();
    } catch {}
    setActiveSession(null);
    setSession(null);
    await SecureStore.deleteItemAsync(SESSION_KEY);
  };

  const value = useMemo<AuthValue>(
    () => ({ session, ready, server, database, setServer, signIn, signOut }),
    [session, ready, server, database],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
