'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import './global.css';

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const excludedPaths = [
        '/view/pages/Login',
        '/view/pages/Register',
        '/view/pages/ForgotPassword', 
    ];

    if (excludedPaths.some((path) => pathname.startsWith(path))) {
        return <>{children}</>;
    }


  const handleLogout = () => {
    console.log('User logged out');
    localStorage.removeItem('token');
    window.location.href = '/view/pages/Login';
  };

  return (
    <div className="container">
      {/* Top Bar */}
      <header className="topBar">
        <div className="rightSection">
          <img src="/assets/flag.png" alt="Flag" className="icon" />
          <img src="/assets/notification.png" alt="Notification" className="icon" />
          <div className="userInfo">
            <img src="/assets/user.png" alt="User Avatar" className="avatar" />
            <span
              className="userName"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              Nguyen Van A
            </span>
            {isDropdownOpen && (
              <div className="dropdown">
                <button onClick={handleLogout} className="logoutButton">
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="sidebar">
        <Link href="/view/pages/Home" className="logo">
          <img src="/assets/logo.png"  />
        </Link>

        <nav>
          <ul>
            <li className={pathname === '/view/pages/Home' ? 'active' : ''}>
              <Link href="/view/pages/Home">Bảng tổng kết</Link>
            </li>
            <li className={pathname === '/view/pages/projectPage' ? 'active' : ''}>
              <Link href="/view/pages/projectPage">Quản lý dự án</Link>
            </li>
            <li className={pathname === '/view/pages/employeePage' ? 'active' : ''}>
              <Link href="/view/pages/employeePage">Quản lý nhân viên</Link>
            </li>
            <li className={pathname === '/view/pages/chatroomPage' ? 'active' : ''}>
              <Link href="/view/pages/chatroomPage">Phòng trò chuyện</Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="mainContent">{children}</main>
    </div>
  );
}