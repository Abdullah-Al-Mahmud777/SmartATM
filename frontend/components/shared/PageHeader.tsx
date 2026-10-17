'use client';

import { ReactNode } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  const isFetching = useIsFetching();
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw
            className={cn('h-3.5 w-3.5', isFetching > 0 && 'animate-spin text-primary')}
          />
          Auto-refresh 30s
        </span>
        {actions}
      </div>
    </div>
  );
}
