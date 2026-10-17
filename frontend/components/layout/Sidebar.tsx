'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, ShieldCheck, XCircle } from 'lucide-react';
import { cn, initials } from '@/lib/utils';
import { navForRole } from '@/lib/navigation';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function Sidebar({
  user,
  onNavigate,
  onLogout,
}: {
  user?: User;
  onNavigate?: () => void;
  onLogout?: () => void;
}) {
  const pathname = usePathname();
  const items = navForRole(user?.role);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-wide text-white">SmartATM</p>
          <p className="text-[11px] text-sidebar-muted">Network Control</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">
          Overview
        </p>
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'text-sidebar-foreground/80 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'h-[18px] w-[18px] shrink-0',
                  active ? 'text-white' : 'text-sidebar-muted group-hover:text-white'
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
          <Avatar className="h-9 w-9 ring-2 ring-primary/40">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials(user?.name ?? 'SA')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {user?.name ?? 'Loading...'}
            </p>
            <p className="truncate text-[11px] capitalize text-sidebar-muted">
              {user?.role ?? '—'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-muted hover:bg-white/10 hover:text-white"
            onClick={onLogout}
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <p className="flex items-center justify-center gap-1.5 pt-3 text-[10px] text-sidebar-muted">
          <XCircle className="h-3 w-3" /> SmartATM v1.0 · Dhaka, BD
        </p>
      </div>
    </div>
  );
}
