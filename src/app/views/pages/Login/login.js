import React, { useState } from 'react';
import './login.css';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate để chuyển hướng

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); 
  const navigate = useNavigate(); // Sử dụng useNavigate để chuyển hướng

  const handleSubmit = async (event) => {
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
      navigate('/home');

    } catch (error) {
      setError('Login failed, please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img 
          src={process.env.PUBLIC_URL + '/logo.jpg'} 
          alt="Logo" 
          className="login-logo"
        />
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <input
              type="email"
              placeholder="username@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Cập nhật giá trị email
              required
            />
          </div>
          <div className="input-field">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Cập nhật giá trị password
              required
            />
          </div>
          <div className="forgot-password">
            <a href="#">Forgot Password?</a>
          </div>
          {error && <p className="error-message">{error}</p>} {/* Hiển thị lỗi nếu có */}
          <button type="submit" className="login-button">Sign in</button>
        </form>
        <p className="register-link">
          Don't have an account yet? <Link to="/register">Register for free</Link> {/* Dùng Link để chuyển hướng */}
        </p>
      </div>
    </div>
  );
};

export default Login;
