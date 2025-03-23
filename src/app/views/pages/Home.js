import React from 'react';
import './Home.css'; // Import file CSS
import { Bell, MessageSquare, User } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link

const Home = () => {
  return (
    <div className="home-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <img src={process.env.PUBLIC_URL + '/logo.jpg'} alt="Logo" className="logo" />
         
        </div>
        <ul className="menu">
          <h1 className="title">ỨNG DỤNG</h1>
          <li className="menu-item">
            <Link to="/summary">Bảng tổng kết</Link> {/* Liên kết tới trang Bảng tổng kết */}
          </li>
          <li className="menu-item">
            <Link to="/project-management">Quản lý dự án</Link> {/* Liên kết tới trang Quản lý dự án */}
          </li>
          <li className="menu-item">
            <Link to="/employee-management">Quản lý nhân viên</Link> {/* Liên kết tới trang Quản lý nhân viên */}
          </li>
        </ul>
        <div className="chat-room">
          <Link to="/chat-room">Phòng trò chuyện</Link> {/* Liên kết tới trang Phòng trò chuyện */}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <img src="/flag.png" alt="flag" className="flag-icon" />
          <div className="icons">
            <Bell className="icon" />
            <MessageSquare className="icon" />
          </div>
          <div className="profile">
            <User className="icon" /> {/* Biểu tượng người dùng */}
            <span className="profile-name">Nguyen Van A</span> {/* Tên người dùng */}
          </div>
        </div>

        {/* Statistics */}
        <div className="stats">
          <div className="stat-box">
            <h3>Dự án đang làm</h3>
            <p>2</p>
          </div>
          <div className="stat-box">
            <h3>Dự án đã hoàn thành</h3>
            <p>5</p>
          </div>
          <div className="stat-box">
            <h3>Doanh thu</h3>
            <p>12,300,000 đ</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
