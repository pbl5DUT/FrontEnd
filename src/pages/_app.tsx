import '@/styles/globals.css';
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
