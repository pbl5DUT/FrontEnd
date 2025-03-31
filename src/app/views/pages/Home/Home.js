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
       
      </div>

      {/* Main Content */}
      <div className="main-content">
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
