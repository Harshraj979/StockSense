// Global Auth State — simple React context, no third-party state library needed

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api/client';

interface User {
  id: string;
  loginId: string;
  email: string;
  name: string;
  role: 'MANAGER' | 'STAFF';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount — restore session from localStorage if token is valid
  useEffect(() => {
    const token = localStorage.getItem('stocksense_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    api.auth.getMe().then((res) => {
      if (res.success && res.data) {
        setUser(res.data as User);
      } else {
        localStorage.removeItem('stocksense_token');
      }
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const login = async (loginId: string, password: string) => {
    const res = await api.auth.login({ loginId, password });
    if (!res.success || !res.data) {
      // Propagate exact error message to the component
      throw new Error(res.message || 'Invalid Login Id or Password');
    }
    const { user: userData, token } = res.data as { user: User; token: string };
    localStorage.setItem('stocksense_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('stocksense_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
