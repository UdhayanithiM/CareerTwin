// File: app/layout.tsx
import type React from "react";
import "@/app/globals.css";
import { Inter as FontSans } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CareerTwin",
    template: "%s | CareerTwin",
  },
  description: "Your personalized AI career co-pilot, guiding you from confusion to job-readiness.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased scroll-smooth", fontSans.variable)}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}