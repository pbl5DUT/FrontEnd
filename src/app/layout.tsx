'use client';

import './globals.css';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
    return (
        <html lang="en">
            <body>
                <div className="container">
                    {/* Top Bar */}
                    <header className="topBar">
                        <div className="rightSection">
                            <img src="/assets/flag.png" alt="Flag" className="icon" />
                            <img src="/assets/notification.png" alt="Notification" className="icon" />
                            <div className="userInfo">
                                <img src="/user-avatar.png" alt="User Avatar" className="avatar" />
                                <span>Nguyen Van A</span>
                            </div>
                        </div>
                    </header>
                    {/* Sidebar */}
                    <aside className="sidebar">
                        <Link href="/view/pages/Home">
                            <img src="/assets/logo.png" className="logo" />
                        </Link>
                        
                        <nav>
                            <ul>
                                <li className={pathname === '/view/pages/Home' ? 'active' : ''}>
                                    <Link href="/view/pages/Home">Bảng tổng kết</Link>
                                </li>
                                <li className={pathname === '#' ? 'active' : ''}>
                                    <Link href="#">Quản lý dự án</Link>
                                </li>
                                <li className={pathname === '/view/pages/employeePage' ? 'active' : ''}>
                                    <Link href="/view/pages/employeePage">Quản lý nhân viên</Link>
                                </li>
                                <li className={pathname === '#' ? 'active' : ''}>
                                    <Link href="#">Phòng trò chuyện</Link>
                                </li>
                            </ul>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="mainContent">{children}</main>
                </div>
            </body>
        </html>
    );
}