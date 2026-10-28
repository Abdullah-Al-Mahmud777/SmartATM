'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const inputClassName = cn(
  'h-[52px] w-full rounded-xl border border-field-border bg-field px-4 text-[15px] text-navy shadow-sm',
  'placeholder:text-slate-400 transition duration-150',
  'focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10',
  'disabled:cursor-not-allowed disabled:opacity-60'
);

export const fieldIconClassName =
  'pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-blue';

export const fieldErrorClassName =
  'border-destructive/60 focus:border-destructive focus:ring-destructive/10';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  error?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ id, label, icon: Icon, error, className, ...props }, ref) => {
    const errorId = id ? `${id}-error` : undefined;

    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="block text-sm font-semibold text-navy">
          {label}
        </label>
        <div className="group relative">
          <Icon className={fieldIconClassName} aria-hidden="true" />
          <input
            ref={ref}
            id={id}
            className={cn(inputClassName, 'pl-11 pr-4', error && fieldErrorClassName, className)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
        </div>
        {error ? (
          <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
