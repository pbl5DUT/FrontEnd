import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/contexts/auth_context';
import { UserRole } from '@/modules/auth/services/authService';
import styles from './sidebar.module.css';

// Định nghĩa cấu trúc menu item
interface MenuItem {
  href: string;
  label: string;
  icon: string;
  roles: UserRole[]; // Các role được phép xem menu item này
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

// Menu sections với phân quyền
const sections: MenuSection[] = [
  {
    title: 'ỨNG DỤNG',
    items: [
      {
        href: '/home',
        label: 'Bảng tổng kết',
        icon: '/assets/icons/house-solid.svg',
        roles: [UserRole.ADMIN, UserRole.MANAGE, UserRole.USER],
      },
      {
        href: '/projects',
        label: 'Quản lý dự án',
        icon: '/assets/icons/project.png',
        roles: [UserRole.ADMIN, UserRole.MANAGE, UserRole.USER],
      },
      {
        href: '/employee',
        label: 'Quản lý nhân viên',
        icon: '/assets/icons/employee.png',
        roles: [UserRole.ADMIN, UserRole.MANAGE], // Chỉ admin và manage có quyền
      },
    ],
  },
  {
    title: 'QUẢN TRỊ',
    items: [
      {
        href: '/admin/dashboard',
        label: 'Dashboard Admin',
        icon: '/assets/icons/admin-dashboard.png',
        roles: [UserRole.ADMIN], // Chỉ admin mới có quyền
      },
      {
        href: '/admin/users',
        label: 'Quản lý người dùng',
        icon: '/assets/icons/users-manage.png',
        roles: [UserRole.ADMIN], // Chỉ admin mới có quyền
      },
      {
        href: '/admin/settings',
        label: 'Cài đặt hệ thống',
        icon: '/assets/icons/settings.png',
        roles: [UserRole.ADMIN], // Chỉ admin mới có quyền
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
        roles: [UserRole.ADMIN, UserRole.MANAGE, UserRole.USER], // Tất cả quyền
      },
      {
        href: '/calendar',
        label: 'Lịch làm việc',
        icon: '/assets/icons/calendar.png',
        roles: [UserRole.ADMIN, UserRole.MANAGE, UserRole.USER], // Tất cả quyền
      },
    ],
  },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, checkPermission } = useAuth();

  // Lọc các menu sections dựa trên quyền của người dùng
  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => checkPermission(item.roles)),
    }))
    .filter((section) => section.items.length > 0); // Loại bỏ các section không có item nào

  return (
    <aside className={styles.sidebar}>
      <Link href="/home" className={styles.logo}>
        <img src="/assets/logo.png" alt="Logo" />
      </Link>

      {user && (
        <div className={styles.userRole}>
          <span className={styles.roleTag}>{user.role}</span>
        </div>
      )}

      <nav>
        {filteredSections.map((section) => (
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
