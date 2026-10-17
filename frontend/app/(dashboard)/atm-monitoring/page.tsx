'use client';

import * as React from 'react';
import { MapPin, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useAtms, useDeleteAtm, useMe } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/useDebounce';
import type { Atm } from '@/lib/types';
import { cn, formatCompact } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
import { AtmFormDialog } from '@/components/atm/AtmFormDialog';

const levelColor = (pct: number) =>
  pct <= 10 ? 'bg-red-500' : pct <= 25 ? 'bg-amber-500' : pct <= 60 ? 'bg-sky-500' : 'bg-emerald-500';

export default function AtmMonitoringPage() {
  const { data: me } = useMe();
  const role = me?.data?.role;
  const canManage = role === 'admin' || role === 'manager';

  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search);
  const [status, setStatus] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Atm | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Atm | null>(null);

  const deleteAtm = useDeleteAtm();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('search');
    if (initial) setSearch(initial);
  }, []);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const { data, isLoading, isError, refetch } = useAtms({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
  });

  const atms = data?.data ?? [];
  const meta = data?.meta;

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (atm: Atm) => {
    setEditing(atm);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteAtm.mutate(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ATM Monitoring"
        description="Monitor status, cash levels and health of every ATM"
        actions={
          canManage ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add ATM
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ATM ID, name or address..."
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v)}
          >
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isError ? (
        <ErrorState message="Could not load ATMs." onRetry={() => refetch()} />
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
              <EmptyState
                className="m-4"
                title="No ATMs found"
                description="Try adjusting your search or filters."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ATM</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="min-w-[180px]">Cash Level</TableHead>
                    <TableHead className="text-right">Last Refill</TableHead>
                    {canManage && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atms.map((atm) => {
                    const pct = atm.capacity
                      ? Number(((atm.cash / atm.capacity) * 100).toFixed(0))
                      : 0;
                    return (
                      <TableRow key={atm._id}>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-semibold">{atm.atmId}</p>
                              <p className="text-xs text-muted-foreground">{atm.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{atm.area}</TableCell>
                        <TableCell>
                          <StatusBadge kind="atm" value={atm.status} />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">{formatCompact(atm.cash)}</span>
                              <span className="text-muted-foreground">{pct}%</span>
                            </div>
                            <Progress
                              value={pct}
                              indicatorClassName={cn(levelColor(pct))}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {atm.lastRefill
                            ? new Date(atm.lastRefill).toLocaleDateString('en-GB', {
                                timeZone: 'Asia/Dhaka',
                              })
                            : '—'}
                        </TableCell>
                        {canManage && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEdit(atm)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              {role === 'admin' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteTarget(atm)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <Pagination meta={meta} onPageChange={setPage} />

      <AtmFormDialog open={dialogOpen} onOpenChange={setDialogOpen} atm={editing} />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Trash2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">Delete {deleteTarget.atmId}?</p>
                  <p className="text-xs text-muted-foreground">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteAtm.isPending}
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
