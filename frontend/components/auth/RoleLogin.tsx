'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLogin, useLogout, useMe } from '@/hooks/useApi';
import type { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface RoleLoginConfig {
  label: string;
  title: string;
  subtitle: string;
  tagline: string;
  email: string;
  password: string;
  icon: LucideIcon;
  gradient: string;
}

export const ROLE_LOGIN: Record<UserRole, RoleLoginConfig> = {
  admin: {
    label: 'Administrator',
    title: 'Administrator Sign In',
    subtitle: 'Full control over the SmartATM network',
    tagline: 'Manage users, settings and the entire ATM fleet.',
    email: 'admin@smartatm.com',
    password: 'admin123',
    icon: ShieldCheck,
    gradient: 'from-violet-600 to-indigo-600',
  },
  manager: {
    label: 'Manager',
    title: 'Manager Sign In',
    subtitle: 'Oversee operations, reports and cash flow',
    tagline: 'Track transactions, alerts and cash availability.',
    email: 'manager@smartatm.com',
    password: 'manager123',
    icon: Briefcase,
    gradient: 'from-blue-600 to-cyan-600',
  },
  operator: {
    label: 'Operator',
    title: 'Operator Sign In',
    subtitle: 'Monitor ATMs and handle maintenance',
    tagline: 'Keep ATMs online and refill cash on time.',
    email: 'operator@smartatm.com',
    password: 'operator123',
    icon: Wrench,
    gradient: 'from-emerald-600 to-teal-600',
  },
};

export function RoleLogin({ role }: { role: UserRole }) {
  const cfg = ROLE_LOGIN[role];
  const Icon = cfg.icon;
  const router = useRouter();
  const login = useLogin();
  const logout = useLogout();
  const { data } = useMe();
  const current = data?.data;

  const [email, setEmail] = React.useState(cfg.email);
  const [password, setPassword] = React.useState(cfg.password);
  const [show, setShow] = React.useState(true);

  const otherRoles = (Object.keys(ROLE_LOGIN) as UserRole[]).filter((r) => r !== role);

  React.useEffect(() => {
    if (current && current.role === role) router.replace('/dashboard');
  }, [current, role, router]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: (res) => {
          const loggedIn = res.data.user;
          if (loggedIn.role !== role) {
            toast.error(
              `This is a ${loggedIn.role} account. Please use the ${loggedIn.role} login.`
            );
            logout.mutate();
            return;
          }
          router.replace('/dashboard');
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen">
      <div
        className={cn(
          'relative hidden w-1/2 flex-col justify-between bg-gradient-to-br p-10 text-white lg:flex',
          cfg.gradient
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 shadow-lg backdrop-blur">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold">SmartATM</p>
            <p className="text-xs text-white/70">{cfg.label} Portal</p>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="max-w-md text-3xl font-bold leading-tight">{cfg.title}</h1>
          <p className="max-w-sm text-sm text-white/80">{cfg.tagline}</p>
          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur">
            <Icon className="h-8 w-8 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{cfg.label} access</p>
              <p className="text-xs text-white/70">{cfg.subtitle}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/60">
          © {new Date().getFullYear()} SmartATM · Dhaka, Bangladesh
        </p>
      </div>

      <div className="flex w-full items-center justify-center bg-background p-6 lg:w-1/2">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center lg:hidden">
            <div
              className={cn(
                'mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white',
                cfg.gradient
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold">SmartATM {cfg.label}</h1>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">{cfg.title}</h2>
            <p className="text-sm text-muted-foreground">{cfg.subtitle}</p>
          </div>

          {current && current.role !== role && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
              <span>
                You are signed in as <b className="capitalize">{current.role}</b>.
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-amber-900 hover:bg-amber-100 dark:text-amber-200"
                onClick={() => logout.mutate()}
              >
                Log out
              </Button>
            </div>
          )}

          <Card>
            <CardContent className="p-6">
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      placeholder={`${role}@smartatm.com`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={show ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-9"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={show ? 'Hide password' : 'Show password'}
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={login.isPending}>
                  {login.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign in as {cfg.label}
                </Button>
              </form>

              <div className="mt-6 space-y-2">
                <p className="text-center text-xs font-medium text-muted-foreground">
                  Demo {cfg.label} account (prefilled)
                </p>
                <div className="rounded-lg border px-3 py-2 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">Email</span>
                    <span className="font-mono">{cfg.email}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <span className="font-semibold">Password</span>
                    <span className="font-mono">{cfg.password}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between text-xs">
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All portals
            </Link>
            <div className="flex items-center gap-3">
              {otherRoles.map((r) => (
                <Link
                  key={r}
                  href={`/login/${r}`}
                  className="capitalize text-muted-foreground hover:text-foreground"
                >
                  {r} login
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
