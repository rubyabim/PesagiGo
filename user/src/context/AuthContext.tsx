import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { AuthResponse } from '../api/client';

type AuthContextValue = {
  session: AuthResponse | null;
  ready: boolean;
  setSession: (next: AuthResponse | null) => void;
  logout: () => Promise<void>;
};

const STORAGE_KEY = 'pesagigo.auth.session';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthResponse | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restore = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setSessionState(JSON.parse(raw) as AuthResponse);
        }
      } finally {
        setReady(true);
      }
    };
    void restore();
  }, []);

  const setSession = (next: AuthResponse | null) => {
    setSessionState(next);
    if (next) {
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return;
    }
    void AsyncStorage.removeItem(STORAGE_KEY);
  };

  const logout = async () => {
    setSessionState(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      session,
      ready,
      setSession,
      logout,
    }),
    [ready, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuthContext must be used inside AuthProvider');
  }
  return value;
}
