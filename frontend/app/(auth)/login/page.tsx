import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LoginCard } from '@/components/smartatm/login-card';
import { LoginShell } from '@/components/smartatm/login-shell';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: { absolute: 'Sign in · SmartATM' },
  description: 'Sign in to your SmartATM online banking account.',
};

export default function LoginPage() {
  return (
    <div className={inter.className}>
      <LoginShell>
        <LoginCard />
      </LoginShell>
    </div>
  );
}
