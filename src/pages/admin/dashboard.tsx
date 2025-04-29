import React from 'react';
import Head from 'next/head';
import { MainLayout } from '@/layouts/Mainlayout';
import ProtectedRoute from '@/modules/auth/components/protected_route';
import { UserRole } from '@/modules/auth/services/authService';
import { useAuth } from '@/modules/auth/contexts/auth_context';
import pageStyles from '@/styles/mainPage.module.css';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
      <>
        <Head>
          <title>Admin Dashboard | IT Project Management</title>
          <link rel="icon" href="/assets/logo.png" />
        </Head>

        <div>
          admin
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          admin
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          admin
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          admin
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          admin
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          admin
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
          <h1>xin chào</h1>
        </div>
      </>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
