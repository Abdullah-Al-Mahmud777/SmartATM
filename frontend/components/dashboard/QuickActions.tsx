'use client';

import Link from 'next/link';
import {
  ArrowLeftRight,
  BarChart3,
  BellRing,
  PlusCircle,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { useMe } from '@/hooks/useApi';
import type { UserRole } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Action {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  roles: UserRole[];
}

const ACTIONS: Action[] = [
  {
    label: 'Add ATM',
    href: '/atm-monitoring',
    icon: PlusCircle,
    color: 'bg-primary/10 text-primary',
    roles: ['admin', 'manager'],
  },
  {
    label: 'New Transaction',
    href: '/transactions',
    icon: ArrowLeftRight,
    color: 'bg-sky-100 text-sky-600',
    roles: ['admin', 'manager', 'operator'],
  },
  {
    label: 'Refill Cash',
    href: '/cash-management',
    icon: Wallet,
    color: 'bg-emerald-100 text-emerald-600',
    roles: ['admin', 'manager', 'operator'],
  },
  {
    label: 'View Alerts',
    href: '/alerts',
    icon: BellRing,
    color: 'bg-amber-100 text-amber-600',
    roles: ['admin', 'manager', 'operator'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
    color: 'bg-violet-100 text-violet-600',
    roles: ['admin', 'manager'],
  },
  {
    label: 'Manage Users',
    href: '/users',
    icon: UserPlus,
    color: 'bg-rose-100 text-rose-600',
    roles: ['admin', 'manager'],
  },
];

export function QuickActions() {
  const { data } = useMe();
  const role = data?.data?.role;
  const actions = ACTIONS.filter((a) => (role ? a.roles.includes(role) : false));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <p className="text-xs text-muted-foreground">Common tasks</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-colors hover:border-primary/40 hover:bg-accent"
              >
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-105',
                    action.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
