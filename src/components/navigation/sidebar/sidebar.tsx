
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import styles from './sidebar.module.css';

export const Sidebar = () => {

    const pathname = usePathname();
    
    return (
        <aside className={styles.sidebar}>
          <Link href="/home/home" className={styles.logo}>
            <img src="/assets/logo.png" />
          </Link>

          <nav>
            <ul>
              <li className={pathname === '/home/home' ? styles.active : ''}>
                <Link href="/home/home">Bảng tổng kết</Link>
              </li>
              <li className={pathname === '/view/pages/projectPage' ? styles.active : ''}>
                <Link href="/view/pages/projectPage">Quản lý dự án</Link>
              </li>
              <li className={pathname === '/employee/page' ? styles.active : ''}>
                <Link href="/employee/page">Quản lý nhân viên</Link>
              </li>
              <li className={pathname === '/view/pages/chatroomPage' ? styles.active : ''}>
                <Link href="/view/pages/chatroomPage">Phòng trò chuyện</Link>
              </li>
            </ul>
          </nav>
      </aside>
    )
}
