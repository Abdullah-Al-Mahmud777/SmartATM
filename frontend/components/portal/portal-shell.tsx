'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftRight,
  ChevronDown,
  Landmark,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { toast } from 'sonner';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { AUTH_EXPIRED_EVENT, getErrorMessage } from '@/lib/api';
import { useLogout, useMe, useSessionStatus } from '@/lib/hooks';
import { cn, initials } from '@/lib/utils';
import { NotificationMenu } from './notification-menu';
import { SessionTimeout } from './session-timeout';

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/accounts', label: 'Accounts', icon: WalletCards },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/accounts': 'Accounts',
  '/transactions': 'Transactions',
};

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10'
                : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
            )}
          >
            <item.icon
              className={cn(
                'h-[18px] w-[18px]',
                active ? 'text-sky-300' : 'text-slate-500 group-hover:text-slate-300'
              )}
            />
            {item.label}
            {active && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sky-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-[#07182e] px-4 py-5">
      <Link href="/dashboard" onClick={onNavigate} className="mb-8 px-2">
        <Brand theme="dark" />
      </Link>

      <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Banking
      </div>
      <NavLinks onNavigate={onNavigate} />

      <div className="mt-auto">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
            Protected session
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
            You will be signed out automatically after 10 minutes of inactivity.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2 px-2 text-[10px] text-slate-600">
          <Landmark className="h-3.5 w-3.5" />
          SmartBank · Customer portal
        </div>
      </div>
    </div>
  );
}

export function PortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = useSessionStatus();
  const isAuthenticated = session.data?.authenticated === true;
  const me = useMe(isAuthenticated);
  const logout = useLogout();

  useEffect(() => {
    if (session.data?.authenticated === false) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, session.data?.authenticated]);

  useEffect(() => {
    if (me.isError) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [me.isError, pathname, router]);

  useEffect(() => {
    const handleExpired = () => {
      queryClient.clear();
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, [pathname, queryClient, router]);

  const expire = useCallback(() => {
    toast.info('You were signed out after 10 minutes of inactivity.');
    logout.mutate();
  }, [logout]);

  if (session.isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f6f8fc]">
        <Brand theme="light" />
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your secure session...
        </div>
      </div>
    );
  }

  if (session.isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f6f8fc] px-6 text-center">
        <Brand theme="light" />
        <p className="max-w-md text-sm text-slate-600">
          {getErrorMessage(session.error)}
        </p>
        <Button variant="outline" onClick={() => session.refetch()}>
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f6f8fc]">
        <Brand theme="light" />
        <p className="text-sm text-slate-500">Redirecting you to sign in...</p>
      </div>
    );
  }

  if (me.isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f6f8fc]">
        <Brand theme="light" />
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your secure session...
        </div>
      </div>
    );
  }

  if (me.isError || !me.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f6f8fc]">
        <Brand theme="light" />
        <p className="text-sm text-slate-500">Redirecting you to sign in...</p>
      </div>
    );
  }

  const user = me.data.user;
  const title = pageTitles[pathname] ?? 'SmartBank';

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] border-0 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">{title}</div>
              <div className="hidden text-xs text-slate-500 sm:block">
                Signed in as {user.userId}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <NotificationMenu />
              <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-xs font-bold text-white">
                      {initials(user.fullName)}
                    </span>
                    <span className="hidden text-left sm:block">
                      <span className="block max-w-[140px] truncate text-sm font-medium leading-tight text-slate-800">
                        {user.fullName}
                      </span>
                      <span className="block text-[11px] leading-tight text-slate-500">
                        {user.userId}
                      </span>
                    </span>
                    <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-slate-400" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900">
                          {user.fullName}
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:bg-red-50 focus:text-red-700"
                    disabled={logout.isPending}
                    onSelect={() => logout.mutate()}
                  >
                    {logout.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      <SessionTimeout onExpire={expire} />
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-52" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
