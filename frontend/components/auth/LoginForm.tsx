'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMe } from '@/hooks/useApi';
import { apiPost, getErrorMessage } from '@/lib/api';
import type { User } from '@/lib/types';
import { ROLES, roleGradient, type RoleKey } from '@/lib/roles';
import { AuthShell } from '@/components/auth/AuthShell';
import { RoleBadge } from '@/components/auth/RoleBadge';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ role }: { role: RoleKey }) {
  const meta = ROLES[role];
  const Icon = meta.icon;
  const router = useRouter();
  const { data } = useMe();
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  });

  React.useEffect(() => {
    if (data?.data) router.replace('/dashboard');
  }, [data, router]);

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    try {
      const res = await apiPost<{ user: User; token: string }>('/auth/login', {
        email: values.email,
        password: values.password,
      });

      const user = res.data.user;
      if (user.role !== role) {
        const message = `This account is not an ${meta.label}. Choose the correct portal.`;
        setFormError(message);
        toast.error(message);
        await apiPost('/auth/logout').catch(() => undefined);
        return;
      }

      toast.success('Signed in successfully');
      router.replace('/dashboard');
    } catch (error) {
      const message = getErrorMessage(error);
      setFormError(message);
      toast.error(message);
    }
  };

  const fillDemo = () => {
    setValue('email', meta.demo.email, { shouldValidate: true });
    setValue('password', meta.demo.password, { shouldValidate: true });
    clearErrors();
  };

  return (
    <AuthShell>
      <div className="animate-auth-fade-up">
        <div
          className="relative overflow-hidden rounded-[20px] bg-white shadow-[0_20px_55px_-24px_rgba(37,99,235,0.45)] ring-1 ring-slate-100"
          style={{ borderLeft: `4px solid ${meta.color}` }}
        >
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rotate-45 opacity-[0.07]"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${meta.color} 0 7px, transparent 7px 14px)`,
            }}
            aria-hidden="true"
          />

          <div className="relative p-7 sm:p-8">
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
                style={{
                  backgroundImage: roleGradient(meta),
                  boxShadow: `0 12px 26px -10px ${meta.color}`,
                }}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <RoleBadge role={role} />
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Welcome back
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">{meta.description}</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
              {formError && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@smartatm.com"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className="h-12 rounded-xl border-slate-200 pl-10 focus-visible:border-[#2563EB] focus-visible:ring-2 focus-visible:ring-[#2563EB]/30 aria-[invalid=true]:border-red-400"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-xs font-medium text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">
                  Password
                </Label>
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password')}
                />
                {errors.password && (
                  <p id="password-error" className="text-xs font-medium text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/40"
                    {...register('remember')}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() =>
                    toast.info('Contact your administrator to reset your password.')
                  }
                  className="text-sm font-medium text-[#2563EB] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:translate-y-0 disabled:opacity-70"
                style={{
                  backgroundImage: roleGradient(meta),
                  boxShadow: `0 16px 30px -14px ${meta.color}`,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3">
              <p className="text-center text-xs font-medium text-slate-500">
                Default {meta.label} credentials
              </p>
              <div className="mt-2 space-y-1 font-mono text-xs text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">Email</span>
                  <span>{meta.demo.email}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">Password</span>
                  <span>{meta.demo.password}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={fillDemo}
                className="mt-3 h-10 w-full rounded-xl border-slate-300 text-slate-600 hover:bg-white"
              >
                Use demo account
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-2">
          <Link
            href="/portals"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to portals
          </Link>
          <p className="text-xs text-slate-400">
            Need access? Contact your administrator.
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
