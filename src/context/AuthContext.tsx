import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          const res = await api.getMe();
          setUser(res.user);
        } else {
          // Auto load demo user for smooth hackathon preview
          const res = await api.loginDemo();
          setUser(res.user);
          setToken(res.token);
          localStorage.setItem('auth_token', res.token);
        }
      } catch (err) {
        console.warn('Auth check fallback to demo login:', err);
        try {
          const res = await api.loginDemo();
          setUser(res.user);
          setToken(res.token);
          localStorage.setItem('auth_token', res.token);
        } catch (e) {
          console.error('Demo auth failed:', e);
        }
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('auth_token', res.token);
  };

  const register = async (name: string, email: string, pass: string) => {
    const res = await api.register(name, email, pass);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('auth_token', res.token);
  };

  const loginDemo = async () => {
    const res = await api.loginDemo();
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('auth_token', res.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
