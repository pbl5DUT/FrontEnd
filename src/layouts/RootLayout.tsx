import Head from 'next/head';

interface RootLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const RootLayout = ({ children, title = 'PBL5 Management System' }: RootLayoutProps) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/assets/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="PBL5 Management System" />
      </Head>
      {children}
    </>
  );
};
