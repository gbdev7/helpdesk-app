import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, loadBaseUrl, setToken, setUnauthorizedHandler } from '../api/client';
import { Session, User } from '../types';
import { decodeJwt } from '../utils/jwt';

const SESSION_KEY = '@helpdesk/session';

interface AuthContextData {
  session: Session | null;
  profile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    setToken(null);
    setSession(null);
    setProfile(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  }, []);

  const loadProfile = useCallback(async (s: Session) => {
    try {
      setProfile(await api.getUser(s.id));
    } catch {
      /* perfil é opcional; a sessão continua válida */
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => { signOut(); });
    (async () => {
      await loadBaseUrl();
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (raw) {
        const s: Session = JSON.parse(raw);
        const claims = decodeJwt(s.token);
        if (claims?.exp && claims.exp * 1000 > Date.now()) {
          setToken(s.token);
          setSession(s);
          loadProfile(s);
        } else {
          await AsyncStorage.removeItem(SESSION_KEY);
        }
      }
      setLoading(false);
    })();
    return () => setUnauthorizedHandler(null);
  }, [signOut, loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token } = await api.login(email.trim(), password);
    const claims = decodeJwt(token);
    if (!claims) throw new Error('Token inválido recebido do servidor.');
    const s: Session = { token, id: Number(claims.id), email: String(claims.sub), role: claims.role };
    setToken(token);
    setSession(s);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
    loadProfile(s);
  }, [loadProfile]);

  const value = useMemo(() => ({ session, profile, loading, signIn, signOut }), [session, profile, loading, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
