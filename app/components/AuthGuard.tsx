'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type Props = {
  isAuthenticated: boolean;
  children: React.ReactNode;
};

export function AuthGuard({ isAuthenticated, children }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

