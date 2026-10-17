'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useAtmStatusMap } from '@/hooks/useApi';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/states';

const AtmMapInner = dynamic(() => import('./AtmMapInner'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

const LEGEND = [
  { label: 'Online', color: 'bg-emerald-500' },
  { label: 'Offline', color: 'bg-red-500' },
  { label: 'Maintenance', color: 'bg-amber-500' },
];

export function AtmStatusMap() {
  const { data, isLoading, isError, refetch } = useAtmStatusMap();
  const atms = data?.data ?? [];
  const [filter, setFilter] = useState<'all' | 'online' | 'offline' | 'maintenance'>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? atms : atms.filter((a) => a.status === filter)),
    [atms, filter]
  );

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>ATM Status Map</CardTitle>
        <div className="flex items-center gap-3">
          {LEGEND.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn('h-2.5 w-2.5 rounded-full', item.color)} />
              {item.label}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {isError ? (
          <ErrorState message="Could not load ATM map." onRetry={() => refetch()} />
        ) : isLoading ? (
          <Skeleton className="h-[340px] w-full" />
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              {(['all', 'online', 'offline', 'maintenance'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors',
                    filter === key
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background hover:bg-accent'
                  )}
                >
                  {key} ({key === 'all' ? atms.length : atms.filter((a) => a.status === key).length})
                </button>
              ))}
            </div>
            <div className="h-[300px] overflow-hidden rounded-lg border">
              <AtmMapInner atms={filtered} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
