'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { apiGet, apiPost, getErrorMessage } from '@/lib/api';
import type { AuthMe, SecurityQuestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormAlert } from './form-alert';
import { FormField } from './form-field';
import { PasswordInput } from './password-input';

const passwordRule =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,72}$/;

const schema = z
  .object({
    fullName: z.string().trim().min(3, 'Full name must be at least 3 characters'),
    mobile: z
      .string()
      .trim()
      .regex(/^\+?[0-9][0-9 -]{6,19}$/, 'Enter a valid mobile number'),
    email: z.string().trim().email('Enter a valid email address'),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose your date of birth'),
    userId: z
      .string()
      .trim()
      .min(4, 'User ID must be at least 4 characters')
      .max(30, 'User ID must be 30 characters or fewer')
      .regex(/^[a-zA-Z0-9._]+$/, 'Use letters, numbers, dots or underscores only'),
    password: z
      .string()
      .regex(
        passwordRule,
        'Use 8+ characters with upper, lower, number and special character'
      ),
    confirmPassword: z.string(),
    transactionPin: z.string().regex(/^\d{4,6}$/, 'PIN must be 4 to 6 digits'),
    securityQuestionId: z.string().min(1, 'Choose a security question'),
    securityAnswer: z.string().trim().min(2, 'Security answer is too short'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

const maxDob = new Date(
  Date.now() - 16 * 365.25 * 24 * 60 * 60 * 1000
)
  .toISOString()
  .slice(0, 10);

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const questions = useQuery({
    queryKey: ['security-questions'],
    queryFn: () =>
      apiGet<SecurityQuestion[]>('/auth/security-questions').then(
        (response) => response.data
      ),
    staleTime: 10 * 60_000,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      mobile: '',
      email: '',
      dateOfBirth: '',
      userId: '',
      password: '',
      confirmPassword: '',
      transactionPin: '',
      securityQuestionId: '',
      securityAnswer: '',
    },
  });

  const registerAccount = useMutation({
    mutationFn: (values: FormValues) =>
      apiPost<AuthMe>('/auth/register', {
        fullName: values.fullName.trim(),
        mobile: values.mobile.trim(),
        email: values.email.trim(),
        dateOfBirth: values.dateOfBirth,
        userId: values.userId.trim(),
        password: values.password,
        transactionPin: values.transactionPin,
        securityQuestionId: values.securityQuestionId,
        securityAnswer: values.securityAnswer.trim(),
      }),
    onSuccess: (_response, values) => {
      toast.success('Your SmartBank account is ready. Please sign in.');
      router.replace(
        `/login?registered=1&userId=${encodeURIComponent(values.userId.trim())}`
      );
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
    registerAccount.mutate(values);
  });

  return (
    <div>
      <div className="mb-7">
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create your SmartBank account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Open a new savings account instantly. Your account starts with a BDT
          0.00 balance and you can sign in as soon as registration is complete.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        {formError && <FormAlert>{formError}</FormAlert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Full name"
            htmlFor="fullName"
            error={errors.fullName?.message}
            className="sm:col-span-2"
          >
            <Input
              id="fullName"
              autoComplete="name"
              placeholder="Your full legal name"
              className="h-10"
              {...register('fullName')}
            />
          </FormField>

          <FormField label="Mobile number" htmlFor="mobile" error={errors.mobile?.message}>
            <Input
              id="mobile"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+8801XXXXXXXXX"
              className="h-10"
              {...register('mobile')}
            />
          </FormField>

          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-10"
              {...register('email')}
            />
          </FormField>

          <FormField
            label="Date of birth"
            htmlFor="dateOfBirth"
            error={errors.dateOfBirth?.message}
          >
            <Input
              id="dateOfBirth"
              type="date"
              max={maxDob}
              className="h-10"
              {...register('dateOfBirth')}
            />
          </FormField>

          <FormField label="User ID" htmlFor="userId" error={errors.userId?.message}>
            <Input
              id="userId"
              autoComplete="username"
              placeholder="e.g. rahim"
              className="h-10"
              {...register('userId')}
            />
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password?.message}>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="Create a password"
              className="h-10"
              {...register('password')}
            />
          </FormField>

          <FormField
            label="Confirm password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword?.message}
          >
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Repeat password"
              className="h-10"
              {...register('confirmPassword')}
            />
          </FormField>

          <FormField
            label="Transaction PIN"
            htmlFor="transactionPin"
            error={errors.transactionPin?.message}
            hint="4 to 6 digits. Used later for transfers."
            className="sm:col-span-2"
          >
            <PasswordInput
              id="transactionPin"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Choose a transaction PIN"
              maxLength={6}
              className="h-10 tracking-[0.3em]"
              {...register('transactionPin')}
            />
          </FormField>

          <FormField
            label="Security question"
            htmlFor="securityQuestionId"
            error={errors.securityQuestionId?.message}
            className="sm:col-span-2"
          >
            <Controller
              control={control}
              name="securityQuestionId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={questions.isLoading}
                >
                  <SelectTrigger id="securityQuestionId" className="h-10">
                    <SelectValue
                      placeholder={
                        questions.isLoading
                          ? 'Loading questions...'
                          : questions.isError
                            ? 'Could not load questions'
                            : 'Choose a question'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {questions.data?.map((question) => (
                      <SelectItem key={question.id} value={question.id}>
                        {question.question}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField
            label="Security answer"
            htmlFor="securityAnswer"
            error={errors.securityAnswer?.message}
            hint="Used only for password recovery. Answers are hashed."
            className="sm:col-span-2"
          >
            <Input
              id="securityAnswer"
              autoComplete="off"
              placeholder="Your answer"
              className="h-10"
              {...register('securityAnswer')}
            />
          </FormField>
        </div>

        <Button
          type="submit"
          className="h-10 w-full"
          disabled={registerAccount.isPending || questions.isLoading}
        >
          {registerAccount.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating your account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
