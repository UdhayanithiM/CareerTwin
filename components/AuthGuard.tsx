// components/AuthGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/components/ui/loading-spinner'; // Assuming you have this component

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // This effect runs whenever the loading state or user object changes.
    if (!isLoading && !user) {
      // If loading is finished and there is still no user, it's safe to redirect.
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    // While the auth state is being determined, show a full-page loading spinner.
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (user) {
    // If loading is finished and a user exists, render the protected page content.
    return <>{children}</>;
  }

  // If not loading and no user, return null to prevent the page from rendering
  // for a split second before the redirect happens.
  return null;
}