// ============================================================================
// app/layout.tsx - ROOT LAYOUT (NO AUTH PROVIDER!)
// ============================================================================
import type { Metadata } from "next";
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Law Firm Management System",
  description: "Professional law firm management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}