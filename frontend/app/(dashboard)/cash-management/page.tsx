'use client';

import * as React from 'react';
import { Banknote, Search, TrendingDown, Wallet } from 'lucide-react';
import { useCashOverview, useMe } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/useDebounce';
import type { Atm } from '@/lib/types';
import { cn, formatCompact, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState, ErrorState } from '@/components/shared/states';
import { RefillDialog } from '@/components/cash/RefillDialog';

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

export default function CashManagementPage() {
  const { data: me } = useMe();
  const role = me?.data?.role;
  const canRefill = role === 'admin' || role === 'manager';

  const [search, setSearch] = React.useState('');
  const debounced = useDebounce(search);
  const [page, setPage] = React.useState(1);
  const [refillTarget, setRefillTarget] = React.useState<Atm | null>(null);

  React.useEffect(() => setPage(1), [debounced]);

  const { data, isLoading, isError, refetch } = useCashOverview({
    page,
    limit: 12,
    search: debounced || undefined,
  });
  const atms = data?.data ?? [];
  const meta = data?.meta;

  const totals = React.useMemo(() => {
    return atms.reduce(
      (acc, a) => {
        acc.cash += a.cash;
        acc.capacity += a.capacity;
        if (a.level === 'critical') acc.critical += 1;
        else if (a.level === 'low') acc.low += 1;
        return acc;
      },
      { cash: 0, capacity: 0, critical: 0, low: 0 }
    );
  }, [atms]);

  const pctOverall = totals.capacity
    ? Number(((totals.cash / totals.capacity) * 100).toFixed(1))
    : 0;

  const summaryCards = [
    {
      label: 'Total Cash',
      value: formatCurrency(totals.cash),
      icon: Wallet,
      cls: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: 'Network Capacity',
      value: `${pctOverall}%`,
      icon: Banknote,
      cls: 'bg-primary/10 text-primary',
    },
    {
      label: 'Low Cash ATMs',
      value: String(totals.low),
      icon: TrendingDown,
      cls: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Critical ATMs',
      value: String(totals.critical),
      icon: TrendingDown,
      cls: 'bg-red-100 text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cash Management"
        description="Track cash levels and refill ATMs across the network"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="mt-1 text-xl font-bold">{card.value}</p>
                </div>
                <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', card.cls)}>
                  <Icon className="h-5 w-5" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ATM by ID, name or area..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <ErrorState message="Could not load cash overview." onRetry={() => refetch()} />
      ) : (
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : atms.length === 0 ? (
              <EmptyState className="m-4" title="No ATMs found" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ATM</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="min-w-[200px]">Cash Level</TableHead>
                    <TableHead className="text-right">Cash</TableHead>
                    <TableHead className="text-right">Capacity</TableHead>
                    <TableHead className="text-right">Level</TableHead>
                    {canRefill && <TableHead className="text-right">Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atms.map((atm) => (
                    <TableRow key={atm._id}>
                      <TableCell>
                        <p className="text-sm font-semibold">{atm.atmId}</p>
                        <p className="text-xs text-muted-foreground">{atm.area}</p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge kind="atm" value={atm.status} />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <Progress
                            value={atm.percentage ?? 0}
                            indicatorClassName={LEVEL_BAR[atm.level ?? 'healthy']}
                          />
                          <span className="text-xs text-muted-foreground">
                            {atm.percentage ?? 0}% full
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatCompact(atm.cash)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {formatCompact(atm.capacity)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'text-xs font-semibold capitalize',
                            LEVEL_TEXT[atm.level ?? 'healthy']
                          )}
                        >
                          {atm.level}
                        </span>
                      </TableCell>
                      {canRefill && (
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => setRefillTarget(atm)}>
                            Refill
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <Pagination meta={meta} onPageChange={setPage} />

      <RefillDialog
        open={Boolean(refillTarget)}
        onOpenChange={(o) => !o && setRefillTarget(null)}
        atm={refillTarget}
      />
    </div>
  );
}
