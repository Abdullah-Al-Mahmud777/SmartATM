'use client';

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTransactionOverview } from '@/hooks/useApi';
import { formatCompact, formatDate, formatNumber } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/shared/states';

export function TransactionChart() {
  const { data, isLoading, isError, refetch } = useTransactionOverview(7);
  const points = data?.data ?? [];

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Transaction Overview</CardTitle>
          <p className="text-xs text-muted-foreground">Last 7 days · count vs. volume</p>
        </div>
      </CardHeader>
      <CardContent>
        {isError ? (
          <ErrorState message="Could not load transactions." onRetry={() => refetch()} />
        ) : isLoading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : points.length === 0 ? (
          <EmptyState title="No transactions" description="No activity in the last 7 days." />
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={points} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => formatDate(v)}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => formatCompact(Number(v))}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                    boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
                  }}
                  labelFormatter={(v) => formatDate(String(v))}
                  formatter={(value: number, name: string) =>
                    name === 'Volume'
                      ? [formatCompact(value), name]
                      : [formatNumber(value), name]
                  }
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="transactions"
                  name="Transactions"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="volume"
                  name="Volume"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f59e0b' }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
