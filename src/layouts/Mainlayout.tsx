import { Sidebar } from '@/components/navigation/sidebar/sidebar';
import { Topbar } from '@/components/navigation/topbar/topbar';
import { RootLayout } from './RootLayout';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const MainLayout = ({ children, title }: MainLayoutProps) => {
  return (
    <RootLayout title={title}>
      <div className="layout-container">
        <Topbar />
        <div className="content-wrapper">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </div>
    </RootLayout>
  );
};