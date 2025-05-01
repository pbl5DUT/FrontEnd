'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../contexts/auth_context';
import { UserRole } from '../services/authService';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute = ({
  children,
  requiredRoles = [UserRole.ADMIN, UserRole.MANAGE, UserRole.USER],
}: ProtectedRouteProps) => {
  const { user, isLoading, checkPermission } = useAuth();
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    // Chỉ kiểm tra quyền truy cập khi đã tải xong thông tin người dùng
    if (!isLoading) {
      // Nếu không có người dùng, chuyển hướng sang trang đăng nhập
      if (!user) {
        console.log(
          '🔒 [ProtectedRoute] User not authenticated, redirecting to login'
        );
        window.location.href = '/auth/login';
        return;
      }

      // Nếu có người dùng nhưng không có quyền truy cập, chuyển hướng sang trang không có quyền
      if (!checkPermission(requiredRoles)) {
        console.log(
          '⛔ [ProtectedRoute] User does not have required permissions'
        );
        window.location.href = '/unauthorized';
        return;
      }

      // Đánh dấu đã kiểm tra quyền truy cập
      console.log('✅ [ProtectedRoute] Access granted');
      setAccessChecked(true);
    }
  }, [user, isLoading, checkPermission, requiredRoles]);

  // Hiển thị trạng thái loading nếu đang tải hoặc chưa kiểm tra xong
  if (isLoading || (!accessChecked && !user)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-xl mb-4">Đang kiểm tra quyền truy cập...</div>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Nếu đã kiểm tra quyền và có quyền truy cập, hiển thị nội dung
  return <>{children}</>;
};

export default ProtectedRoute;
