import Link from 'next/link';
import { SmartAtmLogo } from './smartatm-logo';
import { SecurityBadge } from './security-badge';
import { SmartAtmLoginForm } from './smartatm-login-form';
import { DemoCredentials } from './demo-credentials';

export function LoginCard() {
  return (
    <div className="w-full bg-white px-6 py-10 shadow-card sm:rounded-[28px] sm:border sm:border-white sm:px-10 sm:py-11">
      <div className="flex flex-col items-center text-center">
        <SmartAtmLogo />
        <div className="mt-5">
          <SecurityBadge />
        </div>

        <h1 className="mt-7 text-[28px] font-bold tracking-[-0.03em] text-navy sm:text-[30px]">
          Welcome back
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Please sign in to continue to your account
        </p>
      </div>

      <SmartAtmLoginForm />
      <DemoCredentials />

      <div className="mt-7 space-y-4 text-center">
        <p className="text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold text-brand-blue underline-offset-4 transition-colors hover:text-brand-teal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
          >
            Sign Up
          </Link>
        </p>
        <p className="text-[11px] leading-5 text-slate-400">
          By logging in you agree to our{' '}
          <span className="font-medium text-slate-500 underline decoration-slate-300 underline-offset-2">
            Terms
          </span>{' '}
          &amp;{' '}
          <span className="font-medium text-slate-500 underline decoration-slate-300 underline-offset-2">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
}
