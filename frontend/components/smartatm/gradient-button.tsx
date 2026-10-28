'use client';

import { Loader2 } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GradientButtonProps extends ButtonProps {
  loading?: boolean;
}

export function GradientButton({
  loading = false,
  disabled,
  className,
  children,
  ...props
}: GradientButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'h-[52px] w-full rounded-xl bg-gradient-to-r from-brand-blue to-brand-teal px-6 text-[15px] font-semibold text-white',
        'shadow-lg shadow-brand-blue/20 transition duration-150',
        'hover:brightness-105 active:brightness-95',
        'focus-visible:ring-4 focus-visible:ring-brand-blue/25 focus-visible:ring-offset-2',
        'disabled:opacity-80',
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Signing in...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
