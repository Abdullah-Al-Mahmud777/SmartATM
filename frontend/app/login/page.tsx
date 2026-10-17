import type { Metadata } from 'next';
import { normalizeRole } from '@/lib/roles';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign in · SmartATM',
  description: 'Sign in to the SmartATM control center.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const role = normalizeRole(params.role);

  return <LoginForm role={role} />;
}
