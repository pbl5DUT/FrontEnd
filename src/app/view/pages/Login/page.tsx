"use client";

import React, { useState } from 'react';
import styles from './login.module.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';


const Login = () => {

  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); // Sử dụng useNavigate để chuyển hướng

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    setError(null); 
    const apiUrl = 'https://backend-pbl5-134t.onrender.com/api/login/';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), 
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      console.log('Login successful', data);

      // Chuyển hướng người dùng đến trang home khi đăng nhập thành công
      router.push('/view/pages/Home');

    } catch (error) {
      setError("Login failed, please check your credentials.");
    }
  };

  return (
    <>
    <Head>
      <title>Login</title>
      <link rel="icon" href="/assets/logo.png" type="image/png" />
      <link rel="stylesheet" href="/path/to/your/styles.css" /> {/* Thay đổi đường dẫn đến tệp CSS của bạn */}
    </Head>
    <div className={styles['login-container']}>
    <div className={styles['login-box']}>
        <img 
            src='/assets/logo.png'
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
        <p className={styles['register-link']}>
          Don't have an account yet? <Link href="./Register">Register for free</Link> {/* Dùng Link để chuyển hướng */}
        </p>
      </div>
    </div>
  </>
  );
};

export default Login;
