import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminLoginForm } from '@/components/admin/admin-login-form';

export const metadata: Metadata = { title: 'Admin sign in' };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Suspense>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
