import Head from 'next/head';
import LoginForm from '@/modules/auth/components/LoginForm';

const LoginPage = () => {
  return (
    <>
      <Head>
        <title>Login</title>
        <link rel="icon" href="/assets/logo.png" />
      </Head>
      <LoginForm />
    </>
  );
};

export default LoginPage;
