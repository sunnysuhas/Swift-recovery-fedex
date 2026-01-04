'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import AppHeader from '@/components/layout/header';
import { Skeleton } from '../ui/skeleton';

const AUTH_ROUTES = ['/login', '/signup'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) return; // Wait until user state is determined

    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    if (!user && !isAuthRoute) {
      router.push('/login');
    } else if (user && isAuthRoute) {
      router.push('/');
    }
  }, [user, isUserLoading, router, pathname]);
  
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  if (isUserLoading || (!user && !isAuthPage)) {
    return (
        <div className="flex flex-col h-screen">
            <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                <Skeleton className="h-8 w-32" />
                <div className="flex-1" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </header>
            <main className="flex-1 p-6">
                <Skeleton className="h-full w-full" />
            </main>
        </div>
    );
  }
  
  if (isAuthPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
