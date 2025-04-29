import React from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/modules/auth/contexts/auth_context';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
