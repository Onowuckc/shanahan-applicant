import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import api from '../api/client';

interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  program?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem('umis_applicant_user') || 'null'); } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('umis_applicant_token'));

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await api.post('/auth/login', { username, password });
    const { token: newToken, profile, role } = data;
    const userData: AuthUser = {
      id: profile?.id || '',
      email: profile?.user?.email || '',
      username: username,
      role,
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      status: profile?.admissionStatus || 'PENDING',
      program: profile?.program?.name || '',
    };
    localStorage.setItem('umis_applicant_token', newToken);
    localStorage.setItem('umis_applicant_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  const register = useCallback(async (payload: any) => {
    await api.post('/auth/register-applicant', payload);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('umis_applicant_token');
    localStorage.removeItem('umis_applicant_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
