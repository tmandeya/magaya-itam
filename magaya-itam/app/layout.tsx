import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Magaya Mining - IT Asset Management',
  description: 'Enterprise-grade IT Asset Management System for Magaya Mining',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
