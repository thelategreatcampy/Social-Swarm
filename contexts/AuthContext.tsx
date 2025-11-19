import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { store } from '../services/mockStore';
import { hashPassword, generateUUID } from '../utils/security';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRole, companyName?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on load
  useEffect(() => {
    const initAuth = () => {
      try {
        const savedUser = localStorage.getItem('commish_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          // Validate minimal user structure to prevent corrupt state load
          if (parsed && parsed.id && parsed.role) {
            setUser(parsed);
          } else {
            localStorage.removeItem('commish_user');
          }
        }
      } catch (e) {
        console.error("Auth Hydration Failed:", e);
        localStorage.removeItem('commish_user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // --- EMERGENCY OVERRIDE FOR ADMIN ---
    // This guarantees access even if localStorage is corrupt or hashing fails
    if (email.toLowerCase() === 'admin@socialswarm.net' && password === 'admin123') {
       const adminUser: User = {
         id: 'u_admin',
         email: 'admin@socialswarm.net',
         name: 'System Admin',
         role: UserRole.ADMIN,
         password: 'OVERRIDE_USED' 
       };
       // Ensure Admin is in the store for ID lookups
       store.ensureAdminExists();
       
       setUser(adminUser);
       localStorage.setItem('commish_user', JSON.stringify(adminUser));
       return true;
    }

    // Standard User Login
    const hashedPassword = await hashPassword(password);
    const foundUser = store.login(email, hashedPassword);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('commish_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string, role: UserRole, companyName?: string) => {
    try {
      const hashedPassword = await hashPassword(password);
      const newUser: User = {
        id: generateUUID(),
        email,
        password: hashedPassword, 
        name,
        role,
        companyName: role === UserRole.BUSINESS ? companyName : undefined
      };
      store.register(newUser);
      setUser(newUser);
      localStorage.setItem('commish_user', JSON.stringify(newUser));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = store.updateUser(user.id, updates);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('commish_user', JSON.stringify(updatedUser));
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('commish_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isAuthenticated: !!user, isLoading }}>
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