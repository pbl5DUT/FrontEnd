import React, { useState } from 'react';
import './register.css';
import { useNavigate } from 'react-router-dom'; 

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    reenterPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
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
        navigate('/login');
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
    <div className="register-container">
      <div className="register-box">
        <img 
          src={process.env.PUBLIC_URL + '/logo.jpg'} 
          alt="Logo" 
          className="register-logo"
        />
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <input 
              type="text" 
              name="name" 
              placeholder="Name Enterprise" 
              value={formData.name} 
              onChange={handleChange}
              required 
            />
          </div>
          <div className="input-field">
            <input 
              type="text" 
              name="address" 
              placeholder="Address" 
              value={formData.address} 
              onChange={handleChange}
              required 
            />
          </div>
          <div className="input-field">
            <input 
              type="text" 
              name="phone" 
              placeholder="Phone Number" 
              value={formData.phone} 
              onChange={handleChange}
              required 
            />
          </div>
          <div className="input-field">
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              value={formData.email} 
              onChange={handleChange}
              required 
            />
          </div>
          <div className="input-field">
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={formData.password} 
              onChange={handleChange}
              required 
            />
          </div>
          <div className="input-field">
            <input 
              type="password" 
              name="reenterPassword" 
              placeholder="Reenter password" 
              value={formData.reenterPassword} 
              onChange={handleChange}
              required 
            />
          </div>
          <button type="submit" className="register-button">Sign in</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
