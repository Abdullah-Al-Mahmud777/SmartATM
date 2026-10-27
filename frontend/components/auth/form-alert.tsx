import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertTone = 'error' | 'success' | 'info';

const tones: Record<AlertTone, { wrapper: string; icon: typeof AlertCircle }> = {
  error: {
    wrapper: 'border-red-200 bg-red-50 text-red-700',
    icon: AlertCircle,
  },
  success: {
    wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: CheckCircle2,
  },
  info: {
    wrapper: 'border-sky-200 bg-sky-50 text-sky-700',
    icon: Info,
  },
};

export function FormAlert({
  tone = 'error',
  children,
  className,
}: {
  tone?: AlertTone;
  children: React.ReactNode;
  className?: string;
}) {
  const config = tones[tone];
  const Icon = config.icon;
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm',
        config.wrapper,
        className
      )}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
