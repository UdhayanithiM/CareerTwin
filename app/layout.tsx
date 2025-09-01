/**
 * FortiTwin - Root Layout
 * * This is the top-level layout component for the entire application.
 * It wraps all pages with essential providers and defines global metadata.
 */

import type React from "react";
import "@/app/globals.css";
import { Inter as FontSans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Toaster } from "sonner";
import type { Metadata, Viewport } from "next";
import { cn } from "@/lib/utils";

// Configure the Inter font with a CSS variable
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/**
 * Metadata configuration for SEO and social sharing
 */
export const metadata: Metadata = {
  title: {
    default: "FortiTwin",
    template: "%s | FortiTwin",
  },
  description: "A modern, AI-powered platform for conducting fair and effective interviews and assessments.",
  keywords: ['interview platform', 'recruitment', 'assessment', 'hiring', 'AI interview'],
  authors: [{ name: 'FortiTwin' }],
  openGraph: {
    title: 'FortiTwin',
    description: 'A modern, AI-powered platform for conducting interviews and assessments.',
    type: 'website',
    locale: 'en_US',
    siteName: 'FortiTwin',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'FortiTwin Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FortiTwin',
    description: 'A modern platform for conducting interviews and assessments.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'your-google-site-verification', // Remember to replace this value
  },
};

/**
 * Viewport configuration
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

/**
 * Root layout component that wraps all pages
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* FIX: All icon and manifest links are now correctly placed in the head */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased scroll-smooth", fontSans.variable)}>
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
      </body>
    </html>
  );
}