import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, RoleType } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  role: RoleType;
  isExternal: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: RoleType, isExternal?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('plumb_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await api.getMe();
        setUser(profile);
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('plumb_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      localStorage.setItem('plumb_token', res.access_token);
      setToken(res.access_token);
      const profile = await api.getMe();
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('plumb_token');
    setToken(null);
    setUser(null);
  };

  const switchRole = async (newRole: RoleType, isExternal: boolean = false) => {
    setIsLoading(true);
    try {
      const res = await api.switchRole(newRole, isExternal);
      localStorage.setItem('plumb_token', res.access_token);
      setToken(res.access_token);
      const profile = await api.getMe();
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const role: RoleType = user?.role || 'creator';
  const isExternal: boolean = user?.is_external || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isExternal,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
