'use client';

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTopAtms } from '@/hooks/useApi';
import { formatCompact } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/shared/states';

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export function TopAtms() {
  const { data, isLoading, isError, refetch } = useTopAtms(5);
  const atms = data?.data ?? [];
  const chartData = atms.map((a) => ({
    name: a.atmId.replace('ATM-DHK-', '#'),
    fullName: a.name,
    volume: a.volume,
    transactions: a.transactions,
  }));

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Top Performing ATMs</CardTitle>
        <p className="text-xs text-muted-foreground">By transaction volume · 7 days</p>
      </CardHeader>
      <CardContent className="flex-1">
        {isError ? (
          <ErrorState message="Could not load top ATMs." onRetry={() => refetch()} />
        ) : isLoading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : chartData.length === 0 ? (
          <EmptyState title="No data" description="No ATM performance yet." />
        ) : (
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              >
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatCompact(Number(v))}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#334155' }}
                  axisLine={false}
                  tickLine={false}
                  width={46}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(37,99,235,0.06)' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [formatCompact(value), 'Volume']}
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload?.fullName ?? String(label)
                  }
                />
                <Bar dataKey="volume" radius={[0, 6, 6, 0]} maxBarSize={26}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
