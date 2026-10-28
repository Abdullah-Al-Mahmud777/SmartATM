'use client';

import * as React from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  fieldErrorClassName,
  fieldIconClassName,
  inputClassName,
} from './text-field';

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ id, label, error, className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const errorId = id ? `${id}-error` : undefined;

    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="block text-sm font-semibold text-navy">
          {label}
        </label>
        <div className="group relative">
          <LockKeyhole className={fieldIconClassName} aria-hidden="true" />
          <input
            ref={ref}
            id={id}
            type={visible ? 'text' : 'password'}
            className={cn(
              inputClassName,
              'pl-11 pr-12',
              error && fieldErrorClassName,
              className
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            aria-controls={id}
            className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
          >
            {visible ? (
              <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" />
            ) : (
              <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
            )}
          </button>
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

PasswordField.displayName = 'PasswordField';
