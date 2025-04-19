import React from 'react';
import './Home.css'; 
import Head from 'next/head';

const Home = () => {
  return (
    <>
    <div className="container">
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
      </>
  );
};

export default Home;
