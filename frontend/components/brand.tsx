import { Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandProps {
  theme?: 'light' | 'dark';
  className?: string;
  compact?: boolean;
}

export function Brand({ theme = 'dark', className, compact = false }: BrandProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 shadow-lg shadow-blue-950/20">
        <Landmark className="h-5 w-5 text-white" strokeWidth={2.2} />
      </div>
      {!compact && (
        <div className="leading-none">
          <div
            className={cn(
              'text-lg font-bold tracking-tight',
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            )}
          >
            SmartBank
          </div>
          <div
            className={cn(
              'mt-1 text-[10px] font-medium uppercase tracking-[0.22em]',
              theme === 'dark' ? 'text-sky-200/70' : 'text-slate-500'
            )}
          >
            Online Banking
          </div>
        </div>
      )}
    </div>
  );
}
