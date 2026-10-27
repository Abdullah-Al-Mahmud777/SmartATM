'use client';

import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminLogout, useAdminSession, useAdminSettings } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function AdminShell({ children }: { children: ReactNode }) {
  const { data, isLoading } = useAdminSession();
  const admin = data?.admin;
  const { data: settings } = useAdminSettings(Boolean(admin));
  const adminLogout = useAdminLogout();

  const autoLogoutSeconds = Math.max(60, (settings?.userAutoLogoutMinutes ?? 10) * 60);

  useEffect(() => {
    const timer = window.setTimeout(() => adminLogout.mutate(), autoLogoutSeconds * 1000);
    const warningAt = Math.max(5, autoLogoutSeconds - 120);
    let warned = false;
    const check = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() % (autoLogoutSeconds * 1000)) / 1000);
      const remaining = Math.max(0, autoLogoutSeconds - elapsed);
      if (!warned && remaining <= warningAt) {
        warned = true;
        toast.warning('Your admin session will expire in a few minutes.');
      }
    }, 1000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(check);
    };
  }, [autoLogoutSeconds, adminLogout]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md p-6 text-center text-sm text-slate-500">Loading admin…</Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
          <ShieldCheck className="h-5 w-5 text-sky-600" />
          <div>
            <div className="text-sm font-semibold text-slate-900">SmartBank Admin</div>
            <div className="text-[11px] text-slate-500">Control panel</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-sky-50 text-sky-700"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </nav>
        <div className="border-t border-slate-200 p-3">
          <Button variant="outline" className="w-full" onClick={() => adminLogout.mutate()}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
      <main className="min-h-screen flex-1 p-6">{children}</main>
    </div>
  );
}
