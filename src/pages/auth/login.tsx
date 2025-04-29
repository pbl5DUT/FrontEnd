import Head from 'next/head';
import LoginForm from '@/modules/auth/components/LoginForm';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  isAuthenticated,
  getCurrentUser,
  UserRole,
} from '@/modules/auth/services/authService';

const LoginPage = () => {
  const router = useRouter();

  // Kiểm tra nếu đã đăng nhập thì chuyển hướng
  useEffect(() => {
    if (isAuthenticated()) {
      // Chuyển hướng dựa vào role
      const user = getCurrentUser();
      if (user) {
        if (user.role === UserRole.ADMIN) {
          router.push('/home');
        } else {
          router.push('/home');
        }
      }
    }
  }, [router]);

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
