import '@/styles/globals.css';
// Thêm dòng import CSS calendar global vào đây
import '@/styles/calendar-global.css';
import { AppProps } from 'next/app';
import { AuthProvider } from '@/modules/auth/contexts/auth_context';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
