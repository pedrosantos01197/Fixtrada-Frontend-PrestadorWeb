import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

interface AuthContextData {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  signIn(user: any): Promise<void>;
  signOut(): Promise<void>;
  reloadUser(): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedUser = await storage.getItem('userData');
        const storedToken = await storage.getItem('userToken');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error loading storage data:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function signIn(nextUser: any) {
    try {
      await storage.setItem('userData', JSON.stringify(nextUser));
      if (nextUser.token) {
        await storage.setItem('userToken', nextUser.token);
      }
      setUser(nextUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    }
  }

  async function signOut() {
    try {
      await storage.clear();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  }

  async function reloadUser() {
    try {
      const storedUser = await storage.getItem('userData');
      const storedToken = await storage.getItem('userToken');
      if (storedUser && storedToken) {
        setUser({ ...JSON.parse(storedUser), token: storedToken });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error reloading user:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, signIn, signOut, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
