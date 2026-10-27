'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  FilterX,
  Loader2,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { apiGet, getErrorMessage } from '@/lib/api';
import { useMe } from '@/lib/hooks';
import type { PaginationMeta, Transaction, TransactionType } from '@/lib/types';
import { maskAccountNumber, titleCase, toPaisa } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/portal/empty-state';
import { PageHeader, PageSkeleton } from '@/components/portal/portal-shell';
import { TransactionList } from '@/components/portal/transaction-list';

const transactionTypes: TransactionType[] = [
  'deposit',
  'withdrawal',
  'transfer_debit',
  'transfer_credit',
  'exchange',
  'bill_payment',
  'mobile_recharge',
  'card_payment',
  'loan_installment',
  'fdr_open',
  'dps_contribution',
  'fee',
  'interest',
  'reversal',
];

const PAGE_SIZE = 15;

interface FilterState {
  accountId: string;
  type: string;
  direction: string;
  from: string;
  to: string;
  minAmount: string;
  maxAmount: string;
}

export function TransactionsClient({
  initialAccountId,
}: {
  initialAccountId?: string;
}) {
  const me = useMe();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    accountId: initialAccountId ?? 'all',
    type: 'all',
    direction: 'all',
    from: '',
    to: '',
    minAmount: '',
    maxAmount: '',
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const rangeError = useMemo(() => {
    if (filters.from && filters.to && filters.from > filters.to) {
      return 'Start date must be on or before end date.';
    }
    if (
      filters.minAmount &&
      filters.maxAmount &&
      Number(filters.minAmount) > Number(filters.maxAmount)
    ) {
      return 'Minimum amount cannot be greater than maximum amount.';
    }
    return null;
  }, [filters]);

  const params = useMemo(() => {
    const query: Record<string, unknown> = { page, limit: PAGE_SIZE };
    if (filters.accountId !== 'all') query.accountId = filters.accountId;
    if (search) query.search = search;
    if (filters.type !== 'all') query.type = filters.type;
    if (filters.direction !== 'all') query.direction = filters.direction;
    if (filters.from) query.from = filters.from;
    if (filters.to) query.to = filters.to;
    if (filters.minAmount) query.minAmountPaisa = toPaisa(filters.minAmount);
    if (filters.maxAmount) query.maxAmountPaisa = toPaisa(filters.maxAmount);
    return query;
  }, [page, filters, search]);

  const transactions = useQuery({
    queryKey: ['transactions', params],
    queryFn: () =>
      apiGet<Transaction[]>('/transactions', params).then((response) => ({
        items: response.data,
        meta: response.meta as PaginationMeta,
      })),
    enabled: !rangeError,
    placeholderData: (previous) => previous,
  });

  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const hasFilters =
    Boolean(search) ||
    filters.accountId !== 'all' ||
    filters.type !== 'all' ||
    filters.direction !== 'all' ||
    Boolean(filters.from) ||
    Boolean(filters.to) ||
    Boolean(filters.minAmount) ||
    Boolean(filters.maxAmount);

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setFilters({
      accountId: 'all',
      type: 'all',
      direction: 'all',
      from: '',
      to: '',
      minAmount: '',
      maxAmount: '',
    });
    setPage(1);
  };

  if (me.isLoading) return <PageSkeleton />;

  if (me.isError) {
    return (
      <Card>
        <EmptyState
          icon={AlertTriangle}
          title="Could not load your accounts"
          description={getErrorMessage(me.error)}
          action={
            <Button variant="outline" onClick={() => me.refetch()}>
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          }
        />
      </Card>
    );
  }

  const accounts = me.data?.accounts ?? [];
  const meta = transactions.data?.meta;
  const items = transactions.data?.items ?? [];
  const showAccount = filters.accountId === 'all';
  const selectedAccount = accounts.find((account) => account.id === filters.accountId);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transactions"
        description={
          selectedAccount
            ? `Activity for ${maskAccountNumber(selectedAccount.accountNumber)}`
            : 'Search and filter activity across all your accounts.'
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/accounts">Statements</Link>
          </Button>
        }
      />

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            Filters
          </div>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-slate-500"
              onClick={clearFilters}
            >
              <FilterX className="h-3.5 w-3.5" />
              Clear all
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search description, counterparty or reference"
              className="h-9 pl-9"
              aria-label="Search transactions"
            />
          </div>

          <Select
            value={filters.accountId}
            onValueChange={(value) => update('accountId', value)}
          >
            <SelectTrigger aria-label="Filter by account">
              <SelectValue placeholder="All accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {titleCase(account.accountType)} · {maskAccountNumber(account.accountNumber)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.type} onValueChange={(value) => update('type', value)}>
            <SelectTrigger aria-label="Filter by transaction type">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All transaction types</SelectItem>
              {transactionTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {titleCase(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.direction}
            onValueChange={(value) => update('direction', value)}
          >
            <SelectTrigger aria-label="Filter by direction">
              <SelectValue placeholder="Money in & out" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Money in &amp; out</SelectItem>
              <SelectItem value="credit">Money in</SelectItem>
              <SelectItem value="debit">Money out</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-500" htmlFor="from">
                From
              </label>
              <Input
                id="from"
                type="date"
                value={filters.from}
                max={filters.to || undefined}
                onChange={(event) => update('from', event.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-500" htmlFor="to">
                To
              </label>
              <Input
                id="to"
                type="date"
                value={filters.to}
                min={filters.from || undefined}
                onChange={(event) => update('to', event.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-500" htmlFor="minAmount">
                Min (৳)
              </label>
              <Input
                id="minAmount"
                type="number"
                min="0"
                step="0.01"
                value={filters.minAmount}
                placeholder="0"
                onChange={(event) => update('minAmount', event.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-500" htmlFor="maxAmount">
                Max (৳)
              </label>
              <Input
                id="maxAmount"
                type="number"
                min="0"
                step="0.01"
                value={filters.maxAmount}
                placeholder="Any"
                onChange={(event) => update('maxAmount', event.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </div>

        {rangeError && (
          <p className="mt-3 text-xs font-medium text-destructive">{rangeError}</p>
        )}
      </Card>

      <div className="flex min-h-5 items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {meta
            ? `${meta.total} transaction${meta.total === 1 ? '' : 's'} found`
            : transactions.isFetching
              ? 'Searching...'
              : ''}
        </p>
        {transactions.isFetching && !transactions.isLoading && (
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Updating
          </span>
        )}
      </div>

      {rangeError ? (
        <Card>
          <EmptyState
            icon={AlertTriangle}
            title="Check your filters"
            description={rangeError}
          />
        </Card>
      ) : transactions.isLoading ? (
        <Card className="space-y-3 p-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex animate-pulse items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-slate-100" />
                <div className="h-2.5 w-1/5 rounded bg-slate-100" />
              </div>
              <div className="h-3 w-24 rounded bg-slate-100" />
            </div>
          ))}
        </Card>
      ) : transactions.isError ? (
        <Card>
          <EmptyState
            icon={AlertTriangle}
            title="Could not load transactions"
            description={getErrorMessage(transactions.error)}
            action={
              <Button variant="outline" onClick={() => transactions.refetch()}>
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
            }
          />
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Search}
            title={hasFilters ? 'No matching transactions' : 'No transactions yet'}
            description={
              hasFilters
                ? 'Try widening the date range or clearing one of your filters.'
                : 'Your activity will appear here once transactions are posted.'
            }
            action={
              hasFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  <FilterX className="h-4 w-4" />
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <TransactionList
          transactions={items}
          accounts={accounts}
          showAccount={showAccount}
        />
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || transactions.isFetching}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-xs text-slate-500">
            Page <span className="font-semibold text-slate-700">{meta.page}</span> of{' '}
            {meta.totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages || transactions.isFetching}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
