'use client';

import React, { useState, useEffect } from 'react';
import styles from '../styles/login.module.css';
import { useRouter } from 'next/navigation';
import {
  login,
  isAuthenticated,
  getCurrentUser,
  UserRole,
} from '../services/authService';
import Link from 'next/link';

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Kiểm tra nếu đã đăng nhập khi component mount
  useEffect(() => {
    console.log('LoginForm: Checking if already authenticated');
    if (isAuthenticated()) {
      console.log('LoginForm: Already authenticated, redirecting to home');
      setRedirecting(false);
      router.replace('/home');
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('LoginForm: Attempting login with:', email);
      const data = await login(email, password);
      console.log('LoginForm: Login success');

      // Đánh dấu đang chuyển hướng để tránh useEffect chạy lại
      // setRedirecting(true);

      // Thêm timeout nhỏ để đảm bảo localStorage đã được cập nhật
      setTimeout(() => {
        // ✅ Sử dụng replace thay vì push để không thêm vào history stack
        console.log('LoginForm: Redirecting to home after successful login');
        router.replace('/home');
      }, 100);
    } catch (error: any) {
      console.error('LoginForm: Login failed', error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Đăng nhập thất bại, vui lòng kiểm tra lại thông tin.');
      }
      setRedirecting(false);
    } finally {
      setIsLoading(false);
    }
  };

  // // Nếu đang chuyển hướng, hiển thị thông báo
  // if (redirecting) {
  //   return (
  //     <div className={styles['login-container']}>
  //       <div
  //         style={{
  //           display: 'flex',
  //           flexDirection: 'column',
  //           alignItems: 'center',
  //           justifyContent: 'center',
  //           height: '100%',
  //         }}
  //       >
  //         <div
  //           style={{
  //             border: '4px solid rgba(0, 0, 0, 0.1)',
  //             borderRadius: '50%',
  //             borderTop: '4px solid #3498db',
  //             width: '40px',
  //             height: '40px',
  //             animation: 'spin 1s linear infinite',
  //             marginBottom: '16px',
  //           }}
  //         ></div>
  //         <p>Đang chuyển hướng đến trang chủ...</p>

  //         <style jsx>{`
  //           @keyframes spin {
  //             0% {
  //               transform: rotate(0deg);
  //             }
  //             100% {
  //               transform: rotate(360deg);
  //             }
  //           }
  //         `}</style>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-box']}>
        <img
          src="/assets/logo.png"
          alt="Logo"
          className={styles['login-logo']}
        />
        <h2 className={styles['title']}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles['input-field']}>
            <input
              type="email"
              placeholder="username@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles['input']}
              required
              disabled={isLoading}
            />
          </div>
          <div className={styles['input-field']}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles['input']}
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className={styles['login-button']}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        {error && <p className={styles['error-text']}>{error}</p>}
        <p className={styles['register-link']}>
          Don't have an account?{' '}
          <Link href="/auth/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
