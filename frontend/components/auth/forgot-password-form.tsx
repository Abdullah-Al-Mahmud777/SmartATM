'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, KeyRound, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { apiGet, apiPost, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormAlert } from './form-alert';
import { FormField } from './form-field';
import { PasswordInput } from './password-input';

const lookupSchema = z.object({
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{8,24}$/, 'Enter a valid account number'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose your date of birth'),
});

const resetSchema = z
  .object({
    securityAnswer: z.string().trim().min(1, 'Security answer is required'),
    newPassword: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,72}$/,
        'Use 8+ characters with upper, lower, number and special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type LookupValues = z.infer<typeof lookupSchema>;
type ResetValues = z.infer<typeof resetSchema>;

interface RecoveryDetails extends LookupValues {
  question: string;
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const [details, setDetails] = useState<RecoveryDetails | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const lookupForm = useForm<LookupValues>({
    resolver: zodResolver(lookupSchema),
    defaultValues: { accountNumber: '', dateOfBirth: '' },
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { securityAnswer: '', newPassword: '', confirmPassword: '' },
  });

  const lookup = useMutation({
    mutationFn: (values: LookupValues) =>
      apiGet<{ questionId: string; question: string }>('/auth/recovery/question', {
        accountNumber: values.accountNumber.trim(),
        dateOfBirth: values.dateOfBirth,
      }),
    onSuccess: (response, values) => {
      setDetails({ ...values, question: response.data.question });
      setFormError(null);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      setFormError(message);
      toast.error(message);
    },
  });

  const reset = useMutation({
    mutationFn: (values: ResetValues) =>
      apiPost<null>('/auth/recovery/reset', {
        accountNumber: details?.accountNumber.trim(),
        dateOfBirth: details?.dateOfBirth,
        securityAnswer: values.securityAnswer.trim(),
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      toast.success('Password reset. Sign in with your new password.');
      router.replace('/login');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      setFormError(message);
      toast.error(message);
    },
  });

  if (details) {
    return (
      <div>
        <div className="mb-7">
          <button
            type="button"
            onClick={() => {
              setDetails(null);
              setFormError(null);
              resetForm.reset();
            }}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Answer your security question
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Account ending{' '}
            <span className="font-mono font-medium text-slate-700">
              {details.accountNumber.slice(-4)}
            </span>
            . Answers are not case-sensitive.
          </p>
        </div>

        <form
          onSubmit={resetForm.handleSubmit((values) => {
            setFormError(null);
            reset.mutate(values);
          })}
          className="space-y-5"
          noValidate
        >
          {formError && <FormAlert>{formError}</FormAlert>}

          <FormField
            label="Security question"
            htmlFor="securityAnswer"
            error={resetForm.formState.errors.securityAnswer?.message}
          >
            <div className="rounded-lg border bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700">
              {details.question}
            </div>
            <Input
              id="securityAnswer"
              autoFocus
              autoComplete="off"
              placeholder="Your answer"
              className="mt-2 h-10"
              {...resetForm.register('securityAnswer')}
            />
          </FormField>

          <FormField
            label="New password"
            htmlFor="newPassword"
            error={resetForm.formState.errors.newPassword?.message}
          >
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              placeholder="Create a new password"
              className="h-10"
              {...resetForm.register('newPassword')}
            />
          </FormField>

          <FormField
            label="Confirm new password"
            htmlFor="confirmPassword"
            error={resetForm.formState.errors.confirmPassword?.message}
          >
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Repeat new password"
              className="h-10"
              {...resetForm.register('confirmPassword')}
            />
          </FormField>

          <Button type="submit" className="h-10 w-full" disabled={reset.isPending}>
            {reset.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                Reset password
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-7">
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Recover your password
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Confirm an account you own to see your security question. No email or
          OTP is required.
        </p>
      </div>

      <form
        onSubmit={lookupForm.handleSubmit((values) => {
          setFormError(null);
          lookup.mutate(values);
        })}
        className="space-y-5"
        noValidate
      >
        {formError && <FormAlert>{formError}</FormAlert>}

        <FormField
          label="Account number"
          htmlFor="accountNumber"
          error={lookupForm.formState.errors.accountNumber?.message}
          hint="Try demo account 1001000101 with DOB 1990-01-15."
        >
          <Input
            id="accountNumber"
            inputMode="numeric"
            autoFocus
            placeholder="Your account number"
            className="h-10 font-mono"
            {...lookupForm.register('accountNumber')}
          />
        </FormField>

        <FormField
          label="Date of birth"
          htmlFor="dateOfBirth"
          error={lookupForm.formState.errors.dateOfBirth?.message}
        >
          <Input
            id="dateOfBirth"
            type="date"
            className="h-10"
            {...lookupForm.register('dateOfBirth')}
          />
        </FormField>

        <Button type="submit" className="h-10 w-full" disabled={lookup.isPending}>
          {lookup.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Remembered it?{' '}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
