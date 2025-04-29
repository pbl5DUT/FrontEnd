import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/auth_context';
import { UserRole } from '../services/authService';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [UserRole.ADMIN, UserRole.MANAGE, UserRole.USER],
}) => {
  const { isAuthenticated, user, isLoading, checkPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Chờ quá trình kiểm tra xác thực hoàn tất
    if (!isLoading) {
      // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      // Nếu đã đăng nhập nhưng không có quyền truy cập
      if (!checkPermission(requiredRoles)) {
        router.push('/unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, requiredRoles, router, checkPermission]);

  // Hiển thị loading khi đang kiểm tra xác thực
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Không hiển thị nội dung nếu chưa đăng nhập hoặc không có quyền
  if (!isAuthenticated || !checkPermission(requiredRoles)) {
    return null;
  }

  // Hiển thị nội dung khi đã đăng nhập và có quyền
  return <>{children}</>;
};

export default ProtectedRoute;
