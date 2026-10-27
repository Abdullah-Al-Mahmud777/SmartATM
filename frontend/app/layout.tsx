import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: {
    default: 'SmartBank · Online Banking',
    template: '%s · SmartBank',
  },
  description:
    'SmartBank customer portal for balances, transaction history and account statements.',
  applicationName: 'SmartBank',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#07182e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
