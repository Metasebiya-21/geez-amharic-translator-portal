'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMe, getStoredUser, getToken } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    const stored = getStoredUser();
    if (stored) {
      router.replace(stored.role === 'admin' ? '/admin' : '/dashboard');
      return;
    }
    fetchMe()
      .then((u) => router.replace(u.role === 'admin' ? '/admin' : '/dashboard'))
      .catch(() => router.replace('/login'));
  }, [router]);

  return null;
}
