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

  // Kiểm tra nếu đã đăng nhập thì chuyển hướng
  // useEffect(() => {
  //   if (isAuthenticated()) {
  //     // Chuyển hướng dựa vào role
  //     const user = getCurrentUser();
  //     if (user) {
  //       if (user.role === UserRole.ADMIN) {
  //         router.push('/admin/dashboard');
  //       } else {
  //         router.push('/home');
  //       }
  //     }
  //   }
  // }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await login(email, password);
      console.log('Login success:', data);

      // Chuyển hướng dựa vào role
      const user = data.user;
      if (user.role === UserRole.ADMIN) {
        router.push('/home');
      } else {
        router.push('/home');
      }
    } catch (error: any) {
      // Hiển thị lỗi cụ thể từ API nếu có
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError(
          'Đăng nhập thất bại, vui lòng kiểm tra lại thông tin đăng nhập.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

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
