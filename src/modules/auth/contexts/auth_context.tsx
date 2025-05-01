'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  login as loginService,
  logout as logoutService,
  isAuthenticated,
  getCurrentUser,
  User,
  UserRole,
} from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  checkPermission: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isManager: false,
  login: async () => {},
  logout: () => {},
  checkPermission: () => false,
});

export const useAuth = () => useContext(AuthContext);

interface Props {
  children: ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Khởi tạo trạng thái xác thực khi component mount
  useEffect(() => {
    const initAuth = () => {
      console.log('📣 [AuthContext] Initializing auth state');

      try {
        const isLoggedIn = isAuthenticated();
        console.log('📣 [AuthContext] Is authenticated:', isLoggedIn);

        if (isLoggedIn) {
          const currentUser = getCurrentUser();
          console.log(
            '📣 [AuthContext] Current user:',
            currentUser ? currentUser.email : 'none'
          );

          if (currentUser) {
            setUser(currentUser);
          } else {
            console.log('📣 [AuthContext] Token exists but no user found');
            logoutService();
            setUser(null);
          }
        } else {
          console.log('📣 [AuthContext] No valid token found');
          setUser(null);
        }
      } catch (error) {
        console.error('📣 [AuthContext] Error initializing auth:', error);
        logoutService();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('📣 [AuthContext] Login attempt for:', email);
    setIsLoading(true);

    try {
      const response = await loginService(email, password);
      console.log('📣 [AuthContext] Login successful');
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('📣 [AuthContext] Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('📣 [AuthContext] Logging out');
    logoutService();
    setUser(null);

    // Sử dụng window.location thay vì router để đảm bảo làm mới hoàn toàn
    window.location.href = '/auth/login';
  };

  const checkPermission = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  // Giá trị context được cung cấp cho các component con
  const contextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === UserRole.ADMIN,
    isManager: user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGE,
    login,
    logout,
    checkPermission,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
