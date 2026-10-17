'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useRecentTransactions } from '@/hooks/useApi';
import { formatCurrency, timeAgo, titleCase } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState, ErrorState } from '@/components/shared/states';

export function RecentTransactions() {
  const { data, isLoading, isError, refetch } = useRecentTransactions(8);
  const transactions = data?.data ?? [];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <p className="text-xs text-muted-foreground">Latest network activity</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-primary">
          <Link href="/transactions">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {isError ? (
          <ErrorState message="Could not load transactions." onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState title="No transactions" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>ATM</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((txn) => {
                const atmName =
                  typeof txn.atm === 'string' ? txn.atmCode : txn.atm?.atmId ?? txn.atmCode;
                return (
                  <TableRow key={txn._id}>
                    <TableCell className="font-mono text-xs">{txn.reference}</TableCell>
                    <TableCell className="text-xs font-medium">{atmName}</TableCell>
                    <TableCell className="text-xs">{titleCase(txn.type)}</TableCell>
                    <TableCell className="text-right text-xs font-semibold">
                      {formatCurrency(txn.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge kind="transaction" value={txn.status} />
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {timeAgo(txn.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
