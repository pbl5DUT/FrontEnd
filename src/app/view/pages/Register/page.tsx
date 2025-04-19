"use client";

import React, { useState } from 'react';
import styles from './register.module.css';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link';
import Head from 'next/head';

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    reenterPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Kiểm tra xem password và reenterPassword có khớp nhau không
    if (formData.password !== formData.reenterPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('https://backend-pbl5-134t.onrender.com/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          password: formData.password
        }),
      });

      if (response.ok) {
        // Nếu đăng ký thành công, điều hướng đến trang đăng nhập
        router.push('/login');
      } else {
        // Xử lý lỗi nếu đăng ký thất bại
        const data = await response.json();
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while registering.');
    }
  };

  return (
    <>
    <Head>
      <link rel="icon" href="/assets/logo.png" type="image/png" />
      <title>Register</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Register page for the application." />
    </Head>
    <div className={styles["register-container"]}>
      <div className={styles["register-box"]}>
        <img 
          src='/assets/logo.png'
          alt="Logo" 
          className={styles["register-logo"]}
        />
        <h2 className={styles['title']}>Register</h2>
        <form onSubmit={handleSubmit}>
                <div className={styles['input-field']}>
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="Name Enterprise" 
                        value={formData.name} 
                        onChange={handleChange}
                        className={styles['input']}
                        required 
                    />
                </div>
                <div className={styles['input-field']}>
                    <input 
                        type="text" 
                        name="address" 
                        placeholder="Address" 
                        value={formData.address} 
                        onChange={handleChange}
                        className={styles['input']}
                        required 
                    />
                </div>
                <div className={styles['input-field']}>
                    <input 
                        type="text" 
                        name="phone" 
                        placeholder="Phone Number" 
                        value={formData.phone} 
                        onChange={handleChange}
                        className={styles['input']}
                        required 
                    />
                </div>
                <div className={styles['input-field']}>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        value={formData.email} 
                        onChange={handleChange}
                        className={styles['input']}
                        required 
                    />
                </div>
                <div className={styles['input-field']}>
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        value={formData.password} 
                        onChange={handleChange}
                        className={styles['input']}
                        required 
                    />
                </div>
                <div className={styles['input-field']}>
                    <input 
                        type="password" 
                        name="reenterPassword" 
                        placeholder="Reenter password" 
                        value={formData.reenterPassword} 
                        onChange={handleChange}
                        className={styles['input']}
                        required 
                    />
                </div>
                <button type="submit" className={styles['register-button']}>Sign in</button>
            </form>
        <p className={styles['register-link']}>
          I have an account.  <Link href="/view/pages/Login">Login</Link> {/* Dùng Link để chuyển hướng */}
        </p>
      </div>
    </div>
    </>
  );
};

export default Register;
