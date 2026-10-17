'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings as SettingsIcon,
  User as UserIcon,
} from 'lucide-react';
import { useDashboardAlerts, useLogout } from '@/hooks/useApi';
import type { User } from '@/lib/types';
import { initials, timeAgo } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/shared/StatusBadge';

const severityDot: Record<string, string> = {
  low: 'bg-sky-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

export function Topbar({
  user,
  onOpenMobile,
}: {
  user?: User;
  onOpenMobile: () => void;
}) {
  const router = useRouter();
  const logout = useLogout();
  const { data } = useDashboardAlerts(6);
  const alerts = data?.data ?? [];
  const [search, setSearch] = React.useState('');

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/atm-monitoring?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobile}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <form onSubmit={submitSearch} className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ATMs, transactions, alerts..."
          className="h-10 rounded-full pl-9"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Alerts">
              <Bell className="h-5 w-5" />
              {alerts.length > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                  {alerts.length > 9 ? '9+' : alerts.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Link href="/alerts" className="text-xs font-normal text-primary hover:underline">
                View all
              </Link>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {alerts.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No active alerts
              </p>
            )}
            {alerts.slice(0, 5).map((alert) => (
              <DropdownMenuItem key={alert._id} asChild>
                <Link href="/alerts" className="flex items-start gap-3 py-2.5">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      severityDot[alert.severity] ?? 'bg-slate-400'
                    }`}
                  />
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{alert.title}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(alert.createdAt)}
                      </span>
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                      {alert.message}
                    </span>
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
            {alerts.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="flex items-center justify-center gap-2 py-1.5">
                  <StatusBadge kind="severity" value={alerts[0].severity} />
                  <span className="text-[11px] text-muted-foreground">
                    Latest alert
                  </span>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials(user?.name ?? 'SA')}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-semibold">{user?.name ?? '—'}</span>
                <span className="block text-[11px] capitalize text-muted-foreground">
                  {user?.role ?? ''}
                </span>
              </span>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <UserIcon className="h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <SettingsIcon className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => logout.mutate()}
            >
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
