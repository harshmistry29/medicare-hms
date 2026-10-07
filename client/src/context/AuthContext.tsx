import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser, UserRole } from '../types';
import { authApi } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  switchDemoAccount: (email: string) => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(() => {
    const saved = localStorage.getItem('medicare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('medicare_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('medicare_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('medicare_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.warn('Session expired, clearing storage');
          localStorage.removeItem('medicare_token');
          localStorage.removeItem('medicare_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email: string, password = 'Medicare@123'): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await authApi.login({ email, password });
      if (res.data.success) {
        const { token: jwtToken, user: userData } = res.data.data;
        setToken(jwtToken);
        setUser(userData);
        localStorage.setItem('medicare_token', jwtToken);
        localStorage.setItem('medicare_user', JSON.stringify(userData));
        success('Logged in successfully', `Welcome back, ${userData.name}! (${userData.role})`);
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      error('Login failed', msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await authApi.register(data);
      if (res.data.success) {
        const { token: jwtToken, user: userData } = res.data.data;
        setToken(jwtToken);
        setUser(userData);
        localStorage.setItem('medicare_token', jwtToken);
        localStorage.setItem('medicare_user', JSON.stringify(userData));
        success('Account created', `Welcome to MediCare, ${userData.name}!`);
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      error('Registration failed', msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('medicare_token');
    localStorage.removeItem('medicare_user');
    setUser(null);
    setToken(null);
    success('Logged out', 'You have been logged out safely.');
  };

  const switchDemoAccount = async (email: string) => {
    await login(email, 'Medicare@123');
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        loading: isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchDemoAccount,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
