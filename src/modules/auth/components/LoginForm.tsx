"use client";

import React, { useState } from 'react';
import styles from '../styles/login.module.css';
import { useRouter } from 'next/navigation';
import { login } from '../services/authService';
import Link from 'next/link';

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    console.log('Login success:55555555555555');

    try {
      const data = await login(email, password);
      console.log('Login success:', data);

      if (data.token) {
        localStorage.setItem('token', data.token);
      }
     
      console.log('Login success:', data);
      router.push('/home/home'); 
    } catch (error) {
      setError("Login failed, please check your credentials.");
    }
  };

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-box']}>
        <img src="/assets/logo.png" alt="Logo" className={styles['login-logo']} />
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
            />
          </div>
          <button type="submit" className={styles['login-button']}>Sign in</button>
        </form>
        {error && <p className={styles['error-text']}>{error}</p>}
        <p className={styles['register-link']}>
          Don't have an account? <Link href="/auth/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
