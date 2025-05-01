'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import LoginForm from '../../modules/auth/components/LoginForm'; // Đảm bảo import đúng
import {
  getCurrentUser,
  isAuthenticated,
} from '@/modules/auth/services/authService';
const LoginPage = () => {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        const user = getCurrentUser();
        if (user) {
          // Nếu đã login → redirect khỏi trang login
          await router.replace('/home');
          return;
        }
      }
      setChecking(false); // Hiển thị form nếu chưa login
    };

    checkAuth();
  }, [router]);

  if (checking) {
    // Hiển thị loading trong khi kiểm tra xác thực
    return <div>Đang kiểm tra...</div>;
  }

  return (
    <>
      <Head>
        <title>Login | IT Project Management</title>
        <link rel="icon" href="/assets/logo.png" />
        <meta
          name="description"
          content="Login to IT Project Management System"
        />
      </Head>
      <LoginForm />
    </>
  );
};

export default LoginPage;
