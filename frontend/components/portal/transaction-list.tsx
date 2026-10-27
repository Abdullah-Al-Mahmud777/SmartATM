'use client';

import Link from 'next/link';
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Banknote,
  CreditCard,
  Landmark,
  ReceiptText,
  RotateCcw,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import type { Account, Transaction } from '@/lib/types';
import {
  cn,
  formatDateTime,
  formatMoney,
  maskAccountNumber,
  titleCase,
} from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from './empty-state';

const typeIcons = {
  deposit: Banknote,
  withdrawal: Wallet,
  transfer_debit: ArrowUpRight,
  transfer_credit: ArrowDownLeft,
  exchange: ArrowRightLeft,
  bill_payment: ReceiptText,
  mobile_recharge: Smartphone,
  card_payment: CreditCard,
  loan_installment: Landmark,
  fdr_open: TrendingUp,
  dps_contribution: TrendingUp,
  fee: ReceiptText,
  interest: TrendingUp,
  reversal: RotateCcw,
} satisfies Record<Transaction['type'], typeof Banknote>;

const statusVariants = {
  completed: 'success',
  pending: 'warning',
  cancelled: 'muted',
  failed: 'danger',
} as const;

function displayTitle(transaction: Transaction): string {
  if (transaction.counterpartyName) {
    return transaction.direction === 'credit'
      ? `From ${transaction.counterpartyName}`
      : `To ${transaction.counterpartyName}`;
  }
  if (transaction.description) return transaction.description;
  return titleCase(transaction.type);
}

function StatusBadge({ status }: { status: Transaction['status'] }) {
  if (status === 'completed') return null;
  return (
    <Badge variant={statusVariants[status]} className="ml-2 align-middle text-[10px]">
      {titleCase(status)}
    </Badge>
  );
}

function canCancelWithdrawal(transaction: Transaction) {
  return (
    transaction.type === 'withdrawal' &&
    transaction.status === 'pending' &&
    Boolean(transaction.cancelableUntil) &&
    new Date(transaction.cancelableUntil as string).getTime() > Date.now()
  );
}

function CancelWithdrawalButton({
  transaction,
  onCancel,
  cancellingId,
}: {
  transaction: Transaction;
  onCancel?: (transaction: Transaction) => void;
  cancellingId?: string | null;
}) {
  if (!onCancel || !canCancelWithdrawal(transaction)) return null;
  const cancelling = cancellingId === transaction.id;
  return (
    <button
      type="button"
      onClick={() => onCancel(transaction)}
      disabled={cancelling}
      className="ml-2 text-[11px] font-semibold text-rose-600 underline-offset-2 hover:underline disabled:opacity-50"
    >
      {cancelling ? 'Cancelling...' : 'Cancel'}
    </button>
  );
}

function TransactionIcon({ transaction }: { transaction: Transaction }) {
  const Icon = typeIcons[transaction.type] ?? ShoppingBag;
  const credit = transaction.direction === 'credit';
  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
        credit ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
      )}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
}

function Amount({ transaction }: { transaction: Transaction }) {
  const credit = transaction.direction === 'credit';
  return (
    <span
      className={cn(
        'font-semibold tabular-nums',
        credit ? 'text-emerald-600' : 'text-slate-800'
      )}
    >
      {credit ? '+' : '−'}
      {formatMoney(transaction.amountPaisa)}
    </span>
  );
}

export function TransactionList({
  transactions,
  accounts,
  showAccount = false,
  onCancelWithdrawal,
  cancellingId,
}: {
  transactions: Transaction[];
  accounts?: Account[];
  showAccount?: boolean;
  onCancelWithdrawal?: (transaction: Transaction) => void;
  cancellingId?: string | null;
}) {
  const accountLabels = new Map(
    accounts?.map((account) => [account.id, account]) ?? []
  );

  if (transactions.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={ReceiptText}
          title="No transactions found"
          description="Transactions that match your filters will appear here."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
              <TableHead className="pl-5">Transaction</TableHead>
              <TableHead>Date</TableHead>
              {showAccount && <TableHead>Account</TableHead>}
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="pr-5 text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              const account = accountLabels.get(transaction.accountId);
              return (
                <TableRow key={transaction.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <TransactionIcon transaction={transaction} />
                      <div className="min-w-0">
                        <div className="flex items-center text-sm font-medium text-slate-800">
                          <span className="truncate">{displayTitle(transaction)}</span>
                          <StatusBadge status={transaction.status} />
                          <CancelWithdrawalButton
                            transaction={transaction}
                            onCancel={onCancelWithdrawal}
                            cancellingId={cancellingId}
                          />
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                          {transaction.referenceNumber}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-slate-500">
                    {formatDateTime(transaction.createdAt)}
                  </TableCell>
                  {showAccount && (
                    <TableCell className="whitespace-nowrap text-xs text-slate-500">
                      {account ? (
                        <>
                          <span className="font-medium text-slate-700">
                            {titleCase(account.accountType)}
                          </span>
                          <span className="ml-1.5 font-mono">
                            {maskAccountNumber(account.accountNumber)}
                          </span>
                        </>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  )}
                  <TableCell className="whitespace-nowrap text-right text-sm">
                    <Amount transaction={transaction} />
                    {transaction.feePaisa > 0 && (
                      <div className="text-[11px] text-slate-400">
                        fee {formatMoney(transaction.feePaisa)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="pr-5 text-right text-xs tabular-nums text-slate-500">
                    {formatMoney(transaction.balanceAfterPaisa)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {transactions.map((transaction) => {
          const account = accountLabels.get(transaction.accountId);
          return (
            <div key={transaction.id} className="flex gap-3 px-4 py-3.5">
              <TransactionIcon transaction={transaction} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-800">
                      {displayTitle(transaction)}
                      <StatusBadge status={transaction.status} />
                      <CancelWithdrawalButton
                        transaction={transaction}
                        onCancel={onCancelWithdrawal}
                        cancellingId={cancellingId}
                      />
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {formatDateTime(transaction.createdAt)}
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    <Amount transaction={transaction} />
                    <div className="mt-0.5 text-[11px] tabular-nums text-slate-400">
                      {formatMoney(transaction.balanceAfterPaisa)}
                    </div>
                  </div>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
                  <span className="font-mono">{transaction.referenceNumber}</span>
                  {showAccount && account && (
                    <span>· {maskAccountNumber(account.accountNumber)}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function RecentTransactionsCard({
  transactions,
  accounts,
  accountId,
  showAccount = false,
  onCancelWithdrawal,
  cancellingId,
}: {
  transactions: Transaction[];
  accounts?: Account[];
  accountId?: string | null;
  showAccount?: boolean;
  onCancelWithdrawal?: (transaction: Transaction) => void;
  cancellingId?: string | null;
}) {
  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Recent activity</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Your latest completed and pending transactions.
          </p>
        </div>
        <Link
          href={accountId ? `/transactions?accountId=${accountId}` : '/transactions'}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          View all
        </Link>
      </div>
      <TransactionList
        transactions={transactions}
        accounts={accounts}
        showAccount={showAccount}
        onCancelWithdrawal={onCancelWithdrawal}
        cancellingId={cancellingId}
      />
    </div>
  );
}
