'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useMe } from '@/hooks/useApi';
import type { UserRole } from '@/lib/types';
import { ROLE_LOGIN } from '@/components/auth/RoleLogin';
import { cn } from '@/lib/utils';

const ROLES: UserRole[] = ['admin', 'manager', 'operator'];

export default function LoginChooserPage() {
  const router = useRouter();
  const { data } = useMe();
  const current = data?.data;

  React.useEffect(() => {
    if (current) router.replace('/dashboard');
  }, [current, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-4xl space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            SmartATM
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Choose your portal</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with the account that matches your role.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {ROLES.map((role) => {
            const cfg = ROLE_LOGIN[role];
            const Icon = cfg.icon;
            return (
              <Link
                key={role}
                href={`/login/${role}`}
                className="group flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white',
                    cfg.gradient
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-lg font-bold">{cfg.label}</h2>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{cfg.tagline}</p>
                <span className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Sign in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} SmartATM · Dhaka, Bangladesh
        </p>
      </div>
    </div>
  );
}
