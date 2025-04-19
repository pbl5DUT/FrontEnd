// src/pages/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/login'); // tự động chuyển hướng đến trang login
  }, [router]);

  return null; // Không cần render gì cả
}
