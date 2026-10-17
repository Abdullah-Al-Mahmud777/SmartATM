'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useMe } from '@/hooks/useApi';
import { ROLES, ROLE_KEYS, roleGradient } from '@/lib/roles';
import { cn } from '@/lib/utils';

export default function PortalsPage() {
  const router = useRouter();
  const { data } = useMe();
  const current = data?.data;

  React.useEffect(() => {
    if (current) router.replace('/dashboard');
  }, [current, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#f4f8ff] to-[#e8f1ff] p-6">
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
          {ROLE_KEYS.map((role) => {
            const meta = ROLES[role];
            const Icon = meta.icon;
            return (
              <Link
                key={role}
                href={`/login?role=${role}`}
                className="group flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ borderTopColor: meta.color, borderTopWidth: 4 }}
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl text-white'
                  )}
                  style={{ backgroundImage: roleGradient(meta) }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-lg font-bold">{meta.label}</h2>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">
                  {meta.description}
                </p>
                <span className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
