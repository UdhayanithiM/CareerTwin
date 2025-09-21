// components/providers.tsx
"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  // ✨ Get the new listener function from your Firebase-powered store
  const initializeAuthListener = useAuthStore((state) => state.initializeAuthListener);

  // Run the authentication listener setup only once when the app loads
  useEffect(() => {
    const unsubscribe = initializeAuthListener();

    // Clean up the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, [initializeAuthListener]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          {children}
          <Toaster richColors />
        </Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  );
}