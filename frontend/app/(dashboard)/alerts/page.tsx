'use client';

import * as React from 'react';
import { AlertTriangle, BellRing, CheckCircle2, Clock } from 'lucide-react';
import { useAlerts, useAlertStats, useUpdateAlert } from '@/hooks/useApi';
import { cn, timeAgo, titleCase } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export default function AlertsPage() {
  const [status, setStatus] = React.useState('all');
  const [severity, setSeverity] = React.useState('all');
  const [page, setPage] = React.useState(1);

  React.useEffect(() => setPage(1), [status, severity]);

  const { data, isLoading, isError, refetch } = useAlerts({
    page,
    limit: 15,
    status: status === 'all' ? undefined : status,
    severity: severity === 'all' ? undefined : severity,
  });
  const { data: statsData } = useAlertStats();
  const update = useUpdateAlert();

  const alerts = data?.data ?? [];
  const meta = data?.meta;
  const stats = statsData?.data;

  const cards = [
    {
      label: 'Total Alerts',
      value: Object.values(stats?.bySeverity ?? {}).reduce((a, b) => a + b, 0),
      icon: BellRing,
      cls: 'bg-primary/10 text-primary',
    },
    {
      label: 'Active',
      value: stats?.byStatus?.active ?? 0,
      icon: AlertTriangle,
      cls: 'bg-red-100 text-red-600',
    },
    {
      label: 'Acknowledged',
      value: stats?.byStatus?.acknowledged ?? 0,
      icon: Clock,
      cls: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Resolved',
      value: stats?.byStatus?.resolved ?? 0,
      icon: CheckCircle2,
      cls: 'bg-emerald-100 text-emerald-600',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Alerts" description="Monitor and resolve network alerts" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
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
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isError ? (
        <ErrorState message="Could not load alerts." onRetry={() => refetch()} />
      ) : (
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : alerts.length === 0 ? (
              <EmptyState className="m-4" title="No alerts" description="Everything looks good." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert</TableHead>
                    <TableHead>ATM</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert._id}>
                      <TableCell className="max-w-xs">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {alert.message}
                        </p>
                      </TableCell>
                      <TableCell className="text-xs">{alert.atmCode ?? '—'}</TableCell>
                      <TableCell className="text-xs">{titleCase(alert.type)}</TableCell>
                      <TableCell>
                        <StatusBadge kind="severity" value={alert.severity} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge kind="alert" value={alert.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {timeAgo(alert.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {alert.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={update.isPending}
                              onClick={() => update.mutate({ id: alert._id, status: 'acknowledged' })}
                            >
                              Ack
                            </Button>
                          )}
                          {alert.status !== 'resolved' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={update.isPending}
                              onClick={() => update.mutate({ id: alert._id, status: 'resolved' })}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
}
