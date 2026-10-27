import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; registered?: string; userId?: string }>;
}) {
  const params = await searchParams;
  return (
    <LoginForm
      nextPath={params.next}
      registered={params.registered === '1'}
      userId={params.userId}
    />
  );
}
