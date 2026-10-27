'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAdminLogin } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormAlert } from '@/components/auth/form-alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/auth/password-input';

const demoEmail = 'admin@smartbank.com';
const demoPassword = 'Admin@12345';
const showDemoCredentials = process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS === 'true';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const next = nextParam && nextParam.startsWith('/admin') ? nextParam : undefined;
  const login = useAdminLogin();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter the admin email and password.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email');
      return;
    }
    setError(null);
    login.mutate({ email: email.trim(), password, next });
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-sky-600" />
          Admin sign in
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} noValidate className="space-y-4">
          {error && <FormAlert>{error}</FormAlert>}
          <div className="space-y-1.5">
            <Label htmlFor="admin-email">Admin email</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              placeholder="admin@smartbank.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-password">Password</Label>
            <PasswordInput
              id="admin-password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        {showDemoCredentials ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white/70 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Demo access
            </div>
            <p className="mt-1.5 text-sm text-slate-600">
              Email{' '}
              <span className="font-mono font-semibold text-slate-900">{demoEmail}</span>
              {' · '}Password{' '}
              <span className="font-mono font-semibold text-slate-900">{demoPassword}</span>
            </p>
            <button
              type="button"
              className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => {
                setEmail(demoEmail);
                setPassword(demoPassword);
                setError(null);
              }}
            >
              Fill demo credentials
            </button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
