'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMe, getToken } from '@/lib/api';
import type { User } from '@/lib/types';

export function AuthGuard({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Array<'oracle' | 'admin'>;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    fetchMe()
      .then((u) => {
        if (roles && !roles.includes(u.role)) {
          router.replace(u.role === 'admin' ? '/admin' : '/dashboard');
          return;
        }
        setUser(u);
        setReady(true);
      })
      .catch(() => router.replace('/login'));
  }, [router, roles]);

  if (!ready || !user) return null;
  return <>{children}</>;
}
