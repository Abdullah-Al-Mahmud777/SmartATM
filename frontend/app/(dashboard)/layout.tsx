'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMe, useLogout } from '@/hooks/useApi';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const ROUTE_ROLES: Record<string, string[]> = {
  '/reports': ['admin', 'manager'],
  '/users': ['admin', 'manager'],
  '/settings': ['admin'],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading, isError } = useMe();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const user = data?.data;

  const denied =
    !!user &&
    Object.entries(ROUTE_ROLES).some(
      ([route, roles]) =>
        (pathname === route || pathname.startsWith(`${route}/`)) &&
        !roles.includes(user.role)
    );

  React.useEffect(() => {
    if (isError) {
      router.replace('/login');
      return;
    }
    if (denied) router.replace('/dashboard');
  }, [isError, denied, router]);

  if (isLoading || isError || !user || denied) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">
          <Sidebar user={user} onLogout={() => logout.mutate()} />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar
            user={user}
            onNavigate={() => setMobileOpen(false)}
            onLogout={() => logout.mutate()}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 space-y-6 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
