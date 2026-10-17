'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { useReport } from '@/hooks/useApi';
import { downloadCsv, getErrorMessage } from '@/lib/api';
import { formatCompact, formatCurrency, formatDate, formatNumber, titleCase } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorState } from '@/components/shared/states';

const TYPE_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#a855f7', '#ef4444'];
const STATUS_COLORS: Record<string, string> = {
  success: '#16a34a',
  failed: '#ef4444',
  pending: '#f59e0b',
};

export default function ReportsPage() {
  const [period, setPeriod] = React.useState('7d');
  const { data, isLoading, isError, refetch } = useReport(period);
  const report = data?.data;

  const handleExport = async () => {
    try {
      const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;
      const from = new Date(Date.now() - (days - 1) * 86400000).toISOString();
      await downloadCsv('/transactions/export', `report-${period}-${Date.now()}.csv`, { from });
      toast.success('Report exported');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const stats = report
    ? [
        { label: 'Total Transactions', value: formatNumber(report.totals.count) },
        { label: 'Total Volume', value: formatCompact(report.totals.volume) },
        { label: 'Success Rate', value: `${report.totals.successRate}%` },
        { label: 'Avg / Day', value: formatNumber(report.totals.averagePerDay) },
      ]
    : [];

  const typeData = (report?.byType ?? []).map((t) => ({
    name: titleCase(t._id),
    value: t.count,
    volume: t.volume,
  }));

  const dayData = (report?.byDay ?? []).map((d) => ({
    date: d._id,
    count: d.count,
    volume: d.volume,
  }));

  const statusData = Object.entries(report?.statusDistribution ?? {}).map(([k, v]) => ({
    name: titleCase(k),
    value: v as number,
    color: STATUS_COLORS[k] ?? '#64748b',
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Analyse network performance and transaction trends"
        actions={
          <div className="flex items-center gap-3">
            <Tabs value={period} onValueChange={setPeriod}>
              <TabsList>
                <TabsTrigger value="7d">7 days</TabsTrigger>
                <TabsTrigger value="30d">30 days</TabsTrigger>
                <TabsTrigger value="90d">90 days</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        }
      />

      {isError ? (
        <ErrorState message="Could not load report." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="mt-3 h-7 w-24" />
                    </CardContent>
                  </Card>
                ))
              : stats.map((s) => (
                  <Card key={s.label}>
                    <CardContent className="p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {s.label}
                      </p>
                      <p className="mt-1 text-2xl font-bold">{s.value}</p>
                    </CardContent>
                  </Card>
                ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Transaction Volume Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[280px] w-full" />
                ) : (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dayData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                          </linearGradient>
                        </defs>
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
                          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                          labelFormatter={(v) => formatDate(String(v))}
                          formatter={(value: number, name: string) =>
                            name === 'Volume' ? [formatCompact(value), name] : [value, name]
                          }
                        />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="count"
                          name="Transactions"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          fill="url(#volGradient)"
                        />
                        <Area
                          yAxisId="right"
                          type="monotone"
                          dataKey="volume"
                          name="Volume"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          fillOpacity={0}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By Transaction Type</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[280px] w-full" />
                ) : (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                        >
                          {typeData.map((_, i) => (
                            <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                          formatter={(value: number, _name, item) => [
                            `${value} · ${formatCompact(item?.payload?.volume ?? 0)}`,
                            item?.payload?.name,
                          ]}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[240px] w-full" />
                ) : (
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(37,99,235,0.06)' }}
                          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                          {statusData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Top ATMs by Volume</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[240px] w-full" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ATM</TableHead>
                        <TableHead className="text-right">Transactions</TableHead>
                        <TableHead className="text-right">Volume</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(report?.topAtms ?? []).map((atm, i) => (
                        <TableRow key={atm._id}>
                          <TableCell className="flex items-center gap-2 text-sm font-medium">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {i + 1}
                            </span>
                            {atm._id}
                          </TableCell>
                          <TableCell className="text-right text-sm">{atm.count}</TableCell>
                          <TableCell className="text-right text-sm font-semibold">
                            {formatCurrency(atm.volume)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
