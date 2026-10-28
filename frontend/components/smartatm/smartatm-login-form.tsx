'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { FormAlert } from '@/components/auth/form-alert';
import { apiPost, getErrorMessage } from '@/lib/api';
import type { AuthMe, AuthSession } from '@/lib/types';
import {
  SMARTATM_DEMO_EMAIL,
  SMARTATM_DEMO_PASSWORD,
} from '@/lib/smartatm-demo';
import { GradientButton } from './gradient-button';
import { PasswordField } from './password-field';
import { TextField } from './text-field';

const usernamePattern = /^[a-zA-Z0-9._-]{3,}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Email or username is required')
    .refine(
      (value) => emailPattern.test(value) || usernamePattern.test(value),
      'Enter a valid email or username'
    ),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;

const defaultCredentials: LoginValues = {
  identifier: SMARTATM_DEMO_EMAIL,
  password: SMARTATM_DEMO_PASSWORD,
};

export function SmartAtmLoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultCredentials,
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      const response = await apiPost<AuthSession>('/auth/login', {
        identifier: values.identifier.trim(),
        password: values.password,
      });

      const session: AuthMe = {
        user: response.data.user,
        accounts: response.data.accounts,
      };

      queryClient.setQueryData(['session'], { authenticated: true });
      queryClient.setQueryData(['me'], session);

      toast.success(`Welcome back, ${response.data.user.fullName.split(' ')[0]}`);
      router.replace('/dashboard');
      router.refresh();
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} className="mt-7 space-y-5" noValidate>
      {formError ? <FormAlert>{formError}</FormAlert> : null}

      <TextField
        id="identifier"
        label="Email or Username"
        icon={UserRound}
        type="text"
        inputMode="email"
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        placeholder="Enter your email or username"
        autoFocus
        error={errors.identifier?.message}
        {...register('identifier')}
      />

      <div className="space-y-2">
        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-brand-blue underline-offset-4 transition-colors hover:text-brand-teal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <GradientButton type="submit" loading={isSubmitting}>
        Login
      </GradientButton>
    </form>
  );
}
