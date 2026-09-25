import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiFetch, setAuthToken } from './api';
import type { Profile, RegisterInput } from './types';

const TOKEN_KEY = 'en5estoy_token';

interface AuthContextValue {
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface SessionResponse {
  token: string;
  user: { id: number; email: string };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const data = await apiFetch<Profile>('/api/profiles/me');
    setProfile(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    setAuthToken(token);
    refreshProfile()
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [refreshProfile, logout]);

  const applySession = useCallback(
    async (session: SessionResponse) => {
      localStorage.setItem(TOKEN_KEY, session.token);
      setAuthToken(session.token);
      await refreshProfile();
    },
    [refreshProfile]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await apiFetch<SessionResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await applySession(session);
    },
    [applySession]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const session = await apiFetch<SessionResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      await applySession(session);
    },
    [applySession]
  );

  const value = useMemo(
    () => ({ profile, loading, login, register, logout, refreshProfile }),
    [profile, loading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
