'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useCashAvailability } from '@/hooks/useApi';
import { cn, formatCompact } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/shared/states';

const LEVEL_BAR: Record<string, string> = {
  critical: 'bg-red-500',
  low: 'bg-amber-500',
  medium: 'bg-sky-500',
  healthy: 'bg-emerald-500',
};

const LEVEL_TEXT: Record<string, string> = {
  critical: 'text-red-600',
  low: 'text-amber-600',
  medium: 'text-sky-600',
  healthy: 'text-emerald-600',
};

export function CashAvailability() {
  const { data, isLoading, isError, refetch } = useCashAvailability();
  const payload = data?.data;
  const items = payload?.items ?? [];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Cash Availability</CardTitle>
          <p className="text-xs text-muted-foreground">ATMs needing attention</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-primary">
          <Link href="/cash-management">
            Manage <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {isError ? (
          <ErrorState message="Could not load cash levels." onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="All ATMs healthy" description="No ATMs are low on cash right now." />
        ) : (
          <div className="space-y-4">
            {items.slice(0, 6).map((item) => (
              <div key={item.atmId} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.atmId}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.area}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-sm font-semibold', LEVEL_TEXT[item.level])}>
                      {item.percentage}%
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatCompact(item.cash)} / {formatCompact(item.capacity)}
                    </p>
                  </div>
                </div>
                <Progress
                  value={item.percentage}
                  indicatorClassName={LEVEL_BAR[item.level]}
                />
              </div>
            ))}
            {payload?.summary && (
              <div className="mt-2 grid grid-cols-4 gap-2 border-t pt-3 text-center">
                {(['critical', 'low', 'medium', 'healthy'] as const).map((level) => (
                  <div key={level}>
                    <p className={cn('text-lg font-bold', LEVEL_TEXT[level])}>
                      {payload.summary[level] ?? 0}
                    </p>
                    <p className="text-[10px] capitalize text-muted-foreground">{level}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
