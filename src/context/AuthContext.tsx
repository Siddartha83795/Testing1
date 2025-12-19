import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, Location } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole, location?: Location) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoUsers: Record<string, User> = {
  client: {
    id: 'demo-client-1',
    email: 'client@demo.com',
    name: 'Demo Customer',
    role: 'client',
  },
  'staff-medical': {
    id: 'demo-staff-med',
    email: 'staff-med@demo.com',
    name: 'Medical Staff',
    role: 'staff',
    location: 'medical',
  },
  'staff-bitbites': {
    id: 'demo-staff-bit',
    email: 'staff-bit@demo.com',
    name: 'Bit Bites Staff',
    role: 'staff',
    location: 'bitbites',
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole, location?: Location) => {
    if (role === 'client') {
      setUser(demoUsers.client);
    } else if (role === 'staff' && location) {
      setUser(demoUsers[`staff-${location}`]);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
