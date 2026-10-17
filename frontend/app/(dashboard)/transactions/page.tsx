'use client';

import * as React from 'react';
import { Download, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useTransactions } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/useDebounce';
import { downloadCsv, getErrorMessage } from '@/lib/api';
import { formatCurrency, formatDateTime, titleCase } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { NewTransactionDialog } from '@/components/transactions/NewTransactionDialog';

export default function TransactionsPage() {
  const [search, setSearch] = React.useState('');
  const debounced = useDebounce(search);
  const [type, setType] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [sort, setSort] = React.useState('newest');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  React.useEffect(() => {
    setPage(1);
  }, [debounced, type, status, sort, from, to]);

  const params = {
    page,
    limit: 15,
    search: debounced || undefined,
    type: type === 'all' ? undefined : type,
    status: status === 'all' ? undefined : status,
    sort,
    from: from || undefined,
    to: to || undefined,
  };

  const { data, isLoading, isError, refetch } = useTransactions(params);
  const transactions = data?.data ?? [];
  const meta = data?.meta;

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadCsv('/transactions/export', `transactions-${Date.now()}.csv`, {
        search: debounced || undefined,
        type: type === 'all' ? undefined : type,
        status: status === 'all' ? undefined : status,
        from: from || undefined,
        to: to || undefined,
      });
      toast.success('CSV exported');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Browse, filter and export all ATM transactions"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={exporting}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" /> New
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative xl:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, card or customer..."
              className="pl-9"
            />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="balance_inquiry">Balance Inquiry</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="amount_desc">Amount: high → low</SelectItem>
              <SelectItem value="amount_asc">Amount: low → high</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 xl:col-span-2">
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="From date"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label="To date"
            />
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <ErrorState message="Could not load transactions." onRetry={() => refetch()} />
      ) : (
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-11 w-full" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <EmptyState
                className="m-4"
                title="No transactions found"
                description="Try changing filters or date range."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>ATM</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Card</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => {
                    const atmLabel =
                      typeof txn.atm === 'string'
                        ? txn.atmCode
                        : txn.atm?.atmId ?? txn.atmCode;
                    return (
                      <TableRow key={txn._id}>
                        <TableCell className="font-mono text-xs">{txn.reference}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs">
                          {formatDateTime(txn.createdAt)}
                        </TableCell>
                        <TableCell className="text-xs font-medium">{atmLabel}</TableCell>
                        <TableCell className="text-xs">{txn.customerName}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {txn.cardMasked}
                        </TableCell>
                        <TableCell className="text-xs">{titleCase(txn.type)}</TableCell>
                        <TableCell className="text-right text-xs font-semibold">
                          {formatCurrency(txn.amount)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge kind="transaction" value={txn.status} />
                        </TableCell>
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

      <NewTransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
