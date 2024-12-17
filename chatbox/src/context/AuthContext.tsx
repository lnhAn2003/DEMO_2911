// src/context/AuthContext.tsx

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { User } from '../types/Entities';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); 
  const router = useRouter();

  useEffect(() => {
    const storedToken = Cookies.get('token');
  
    if (storedToken) {
      setToken(storedToken);

      axiosInstance.defaults.headers['Authorization'] = `Bearer ${storedToken}`;

      axiosInstance
        .get<User>('/users/profile')
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post('/users/login', {
        email,
        password,
      });
      const { token, user } = response.data;
  
      Cookies.set('token', token, { expires: 1 });
      setToken(token);
      setUser(user);
  
      axiosInstance.defaults.headers['Authorization'] = `Bearer ${token}`;

      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await axiosInstance.post('/users/register', { name, email, password });
      await login(email, password);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setToken(null);
    setUser(null);
    
    delete axiosInstance.defaults.headers['Authorization'];

    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
