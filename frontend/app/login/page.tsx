'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useLogin, useMe } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const DEMO = [
  { label: 'Admin', email: 'admin@smartatm.com', password: 'admin123' },
  { label: 'Manager', email: 'manager@smartatm.com', password: 'manager123' },
  { label: 'Operator', email: 'operator@smartatm.com', password: 'operator123' },
];

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const { data } = useMe();
  const [email, setEmail] = React.useState('admin@smartatm.com');
  const [password, setPassword] = React.useState('admin123');
  const [show, setShow] = React.useState(true);

  React.useEffect(() => {
    if (data?.data) router.replace('/dashboard');
  }, [data, router]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      { onSuccess: () => router.replace('/dashboard') }
    );
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between bg-sidebar p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/40">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold">SmartATM</p>
            <p className="text-xs text-sidebar-muted">Network Control Center</p>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="max-w-md text-3xl font-bold leading-tight">
            Monitor, manage and secure your entire ATM network in real time.
          </h1>
          <ul className="space-y-3 text-sm text-sidebar-muted">
            {[
              'Live ATM status map across Dhaka',
              'Real-time cash availability tracking',
              'Transaction analytics & reporting',
              'Instant alerts and maintenance workflows',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-sidebar-muted">
          © {new Date().getFullYear()} SmartATM · Dhaka, Bangladesh
        </p>
      </div>

      <div className="flex w-full items-center justify-center bg-background p-6 lg:w-1/2">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center lg:hidden">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold">SmartATM Dashboard</h1>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to access the ATM control center
            </p>
          </div>

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
                      placeholder="you@smartatm.com"
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
                  Sign in
                </Button>
              </form>

              <div className="mt-6 space-y-2">
                <p className="text-center text-xs font-medium text-muted-foreground">
                  Demo accounts (click to autofill)
                </p>
                <div className="space-y-1.5">
                  {DEMO.map((d) => (
                    <button
                      key={d.email}
                      type="button"
                      onClick={() => {
                        setEmail(d.email);
                        setPassword(d.password);
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-xs transition-colors hover:bg-accent"
                    >
                      <span className="font-semibold">{d.label}</span>
                      <span className="flex flex-col items-end">
                        <span className="font-mono text-foreground">{d.email}</span>
                        <span className="font-mono text-muted-foreground">
                          {d.password}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
