'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Loader2, LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { apiPost, getErrorMessage } from '@/lib/api';
import type { AuthMe, AuthSession } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormAlert } from './form-alert';
import { FormField } from './form-field';
import { PasswordInput } from './password-input';

const schema = z.object({
  identifier: z.string().trim().min(3, 'Enter your User ID or email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

const demo = { identifier: 'rahim', password: 'Demo@1234' };

export function LoginForm({
  nextPath = '/dashboard',
  registered = false,
  userId,
}: {
  nextPath?: string;
  registered?: boolean;
  userId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: userId ?? '', password: '' },
  });

  const login = useMutation({
    mutationFn: (values: FormValues) =>
      apiPost<AuthSession>('/auth/login', {
        identifier: values.identifier.trim(),
        password: values.password,
      }),
    onSuccess: (response) => {
      const session: AuthMe = {
        user: response.data.user,
        accounts: response.data.accounts,
      };
      queryClient.setQueryData(['session'], { authenticated: true });
      queryClient.setQueryData(['me'], session);
      toast.success(`Welcome back, ${response.data.user.fullName.split(' ')[0]}`);
      router.replace(nextPath.startsWith('/') ? nextPath : '/dashboard');
      router.refresh();
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      setFormError(message);
      toast.error(message);
    },
  });

  const submit = handleSubmit((values) => {
    setFormError(null);
    login.mutate(values);
  });

  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-primary">
          <LogIn className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign in to SmartBank
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Use your User ID or email address to continue to your accounts.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5" noValidate>
        {formError ? (
          <FormAlert>{formError}</FormAlert>
        ) : registered ? (
          <FormAlert tone="success">
            Your SmartBank account is ready. Sign in with the User ID you chose.
          </FormAlert>
        ) : null}

        <FormField label="User ID or email" htmlFor="identifier" error={errors.identifier?.message}>
          <Input
            id="identifier"
            autoComplete="username"
            autoFocus
            placeholder="e.g. rahim or rahim@example.com"
            className="h-10"
            {...register('identifier')}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            className="h-10"
            {...register('password')}
          />
        </FormField>

        <div className="flex items-center justify-between text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
          <Link
            href="/register"
            className="font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
          >
            Create an account
          </Link>
        </div>

        <Button type="submit" className="h-10 w-full" disabled={login.isPending}>
          {login.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white/70 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Demo access
        </div>
        <p className="mt-1.5 text-sm text-slate-600">
          User ID <span className="font-mono font-semibold text-slate-900">rahim</span>{' '}
          · Password <span className="font-mono font-semibold text-slate-900">Demo@1234</span>
        </p>
        <button
          type="button"
          className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
          onClick={() => {
            setValue('identifier', demo.identifier, { shouldValidate: true });
            setValue('password', demo.password, { shouldValidate: true });
          }}
        >
          Fill demo credentials
        </button>
      </div>
    </div>
  );
}
