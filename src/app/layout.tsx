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
                            <img src="/flag.png" alt="Flag" className="icon" />
                            <img src="/notification.png" alt="Notification" className="icon" />
                            <img src="/message.png" alt="Message" className="icon" />
                            <div className="userInfo">
                                <span>Nguyen Van A</span>
                                <img src="/user-avatar.png" alt="User Avatar" className="avatar" />
                            </div>
                        </div>
                    </header>

                    {/* Sidebar */}
                    <aside className="sidebar">
                        <div className="logo">Logo</div>
                        <nav>
                            <ul>
                                <li className={pathname === '#' ? 'active' : ''}>
                                    <Link href="#">Bảng tổng kết</Link>
                                </li>
                                <li className={pathname === '#' ? 'active' : ''}>
                                    <Link href="#">Quản lý dự án</Link>
                                </li>
                                <li className={pathname === 'view/pages/employeePage' ? 'active' : ''}>
                                    <Link href="view/pages/employeePage">Quản lý nhân viên</Link>
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