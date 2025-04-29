import { Sidebar } from '@/components/navigation/sidebar/sidebar';
import { Topbar } from '@/components/navigation/topbar/topbar';
import { RootLayout } from './RootLayout';
import { useAuth } from '@/modules/auth/contexts/auth_context';
import ProtectedRoute from '@/modules/auth/components/protected_route';
import { UserRole } from '@/modules/auth/services/authService';
import { useEffect, useState } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  requiredRoles?: UserRole[]; // Thêm prop để kiểm tra quyền truy cập
}

export const MainLayout = ({
  children,
  title,
  requiredRoles = [UserRole.ADMIN, UserRole.MANAGE, UserRole.USER], // Mặc định cho phép tất cả role
}: MainLayoutProps) => {
  const { isLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Fix hydration mismatch bằng cách chỉ render ở client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Tránh hydration mismatch
  }

  return (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <RootLayout title={title}>
        <div className="layout-container">
          <Topbar />
          <div className="content-wrapper">
            <Sidebar />
            <main className="main-content">
              {isLoading ? (
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  <p>Loading...</p>
                </div>
              ) : (
                children
              )}
            </main>
          </div>
        </div>
      </RootLayout>
    </ProtectedRoute>
  );
};
