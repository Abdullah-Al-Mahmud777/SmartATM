'use client';

import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CreditCard,
  Gauge,
  Network,
} from 'lucide-react';
import { useSummary } from '@/hooks/useApi';
import { cn, formatCompact, formatNumber } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/states';

function Delta({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
        positive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  delta?: number;
  deltaSuffix?: string;
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClass,
  delta,
  deltaSuffix,
}: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <div className="flex items-center gap-2">
            {delta !== undefined && <Delta value={delta} suffix={deltaSuffix} />}
            <span className="text-xs text-muted-foreground">{hint}</span>
          </div>
        </div>
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', iconClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCards() {
  const { data, isLoading, isError, refetch } = useSummary();
  const s = data?.data;

  if (isError) {
    return (
      <ErrorState message="Could not load dashboard summary." onRetry={() => refetch()} />
    );
  }

  if (isLoading || !s) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-7 w-20" />
              <Skeleton className="mt-3 h-4 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total ATMs"
        value={formatNumber(s.totalAtms)}
        hint={`${s.online} online · ${s.offline} offline`}
        icon={Network}
        iconClass="bg-primary/10 text-primary"
        delta={Number(s.uptimePercentage.toFixed(1))}
        deltaSuffix="% uptime"
      />
      <StatCard
        label="Transactions Today"
        value={formatNumber(s.transactionsToday.count)}
        hint={`${formatCompact(s.transactionsToday.volume)} volume`}
        icon={CreditCard}
        iconClass="bg-sky-100 text-sky-600"
        delta={s.transactionsToday.change}
      />
      <StatCard
        label="Cash in Network"
        value={formatCompact(s.cash.total)}
        hint={`${s.cash.percentage}% of capacity`}
        icon={Banknote}
        iconClass="bg-emerald-100 text-emerald-600"
      />
      <StatCard
        label="Success Rate"
        value={`${s.successRate.value}%`}
        hint={`${s.activeAlerts} active alerts`}
        icon={Gauge}
        iconClass="bg-amber-100 text-amber-600"
        delta={s.successRate.change}
        deltaSuffix="pt"
      />
    </div>
  );
}
