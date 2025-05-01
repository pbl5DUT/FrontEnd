'use client';

import React from 'react';
import { Sidebar } from '@/components/navigation/sidebar/sidebar';
import { Topbar } from '@/components/navigation/topbar/topbar';
import { RootLayout } from './RootLayout';
import { useAuth } from '@/modules/auth/contexts/auth_context';
import { UserRole } from '@/modules/auth/services/authService';
import ProtectedRoute from '@/modules/auth/components/protected_route';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  requiredRoles?: UserRole[];
}

export const MainLayout = ({
  children,
  title,
  requiredRoles = [UserRole.ADMIN, UserRole.MANAGE, UserRole.USER],
}: MainLayoutProps) => {
  // Layout này sẽ luôn được bảo vệ, chỉ hiển thị cho người dùng có quyền
  return (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <RootLayout title={title}>
        <div className="layout-container">
          <Topbar />
          <div className="content-wrapper">
            <Sidebar />
            <main className="main-content">{children}</main>
          </div>
        </div>
      </RootLayout>
    </ProtectedRoute>
  );
};
