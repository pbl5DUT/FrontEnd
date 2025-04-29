import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './sidebar.module.css';

const sections = [
  {
    title: 'ỨNG DỤNG',
    items: [
      {
        href: '/home',
        label: 'Bảng tổng kết',
        icon: '/assets/icons/house-solid.svg',
      },
      {
        href: '/projects',
        label: 'Quản lý dự án',
        icon: '/assets/icons/project.png',
      },
      {
        href: '/employee',
        label: 'Quản lý nhân viên',
        icon: '/assets/icons/employee.png',
      },
    ],
  },
  {
    title: 'TIỆN TÍCH',
    items: [
      {
        href: '/chat-room',
        label: 'Phòng trò chuyện',
        icon: '/assets/icons/speech-bubble.png',
      },
    ],
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <Link href="/home" className={styles.logo}>
        <img src="/assets/logo.png" alt="Logo" />
      </Link>

      <nav>
        {sections.map((section) => (
          <div key={section.title} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <ul className={styles.navList}>
              {section.items.map((item) => (
                <li
                  key={item.href}
                  className={`${styles.navItem} ${
                    pathname === item.href ? styles.active : ''
                  }`}
                >
                  <Link href={item.href} className={styles.navLink}>
                    <img src={item.icon} alt="" className={styles.icon} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};
