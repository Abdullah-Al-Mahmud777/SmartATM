'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  Landmark,
  Loader2,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadFile, getErrorMessage } from '@/lib/api';
import { useMe } from '@/lib/hooks';
import type { Account } from '@/lib/types';
import {
  formatDate,
  formatMoney,
  maskAccountNumber,
  titleCase,
} from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AccountCard } from '@/components/portal/account-card';
import { EmptyState } from '@/components/portal/empty-state';
import { PageHeader, PageSkeleton } from '@/components/portal/portal-shell';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

export default function AccountsPage() {
  const me = useMe();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [downloading, setDownloading] = useState<'pdf' | 'xlsx' | null>(null);

  const accounts = me.data?.accounts ?? [];
  const selected: Account | undefined =
    accounts.find((account) => account.id === selectedId) ??
    accounts.find((account) => account.isPrimary) ??
    accounts[0];

  const rangeInvalid = useMemo(() => Boolean(from && to && from > to), [from, to]);

  const statement = useMutation({
    mutationFn: (format: 'pdf' | 'xlsx') =>
      downloadFile(
        `/accounts/${selected?.id}/statement`,
        `statement-${selected?.accountNumber ?? 'account'}.${format}`,
        {
          format,
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        }
      ),
    onMutate: (format) => setDownloading(format),
    onSuccess: () => toast.success('Statement downloaded'),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSettled: () => setDownloading(null),
  });

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

  if (!selected) {
    return (
      <div>
        <PageHeader title="Accounts" description="View your SmartBank accounts." />
        <Card>
          <EmptyState
            icon={WalletCards}
            title="No accounts found"
            description="There are no active accounts linked to your online banking profile."
          />
        </Card>
      </div>
    );
  }

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balancePaisa,
    0
  );

  const copyAccountNumber = async () => {
    await navigator.clipboard.writeText(selected.accountNumber);
    setCopied(true);
    toast.success('Account number copied');
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-7">
      <PageHeader
        title="Accounts"
        description={`${accounts.length} account${
          accounts.length === 1 ? '' : 's'
        } · ${formatMoney(totalBalance)} total balance`}
        actions={
          <Button asChild variant="outline">
            <Link href={`/transactions?accountId=${selected.id}`}>
              View transactions
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            selected={account.id === selected.id}
            allowSelect
            onSelect={(next) => {
              setSelectedId(next.id);
              setFrom('');
              setTo('');
            }}
          />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Account details</CardTitle>
            <Badge variant={selected.status === 'active' ? 'success' : 'muted'}>
              {titleCase(selected.status)}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <Landmark className="h-4 w-4 text-slate-400" />
              <span className="font-mono text-sm font-semibold tracking-wide text-slate-800">
                {selected.accountNumber}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto h-7 px-2"
                onClick={copyAccountNumber}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>

            <div>
              <DetailRow label="Account holder" value={selected.holderName} />
              <DetailRow label="Account type" value={titleCase(selected.accountType)} />
              <DetailRow label="Branch" value={`${selected.branchName} (${selected.branchCode})`} />
              <DetailRow label="Opened" value={formatDate(selected.openedAt)} />
              <DetailRow label="Currency" value={selected.currency} />
              <DetailRow
                label="Available balance"
                value={
                  <span className="font-semibold text-emerald-700">
                    {formatMoney(selected.availableBalancePaisa)}
                  </span>
                }
              />
              <DetailRow
                label="Ledger balance"
                value={formatMoney(selected.balancePaisa)}
              />
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              This account is linked only to your customer profile.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Download statement</CardTitle>
            <p className="text-sm text-slate-500">
              Generate a statement for{' '}
              <span className="font-mono text-slate-700">
                {maskAccountNumber(selected.accountNumber)}
              </span>
              . Leave dates empty to include all activity.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="from" className="text-sm font-medium text-slate-700">
                  From
                </label>
                <Input
                  id="from"
                  type="date"
                  value={from}
                  max={to || undefined}
                  onChange={(event) => setFrom(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="to" className="text-sm font-medium text-slate-700">
                  To
                </label>
                <Input
                  id="to"
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(event) => setTo(event.target.value)}
                />
              </div>
            </div>

            {rangeInvalid && (
              <p className="text-xs font-medium text-destructive">
                Start date must be on or before end date.
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={rangeInvalid || statement.isPending}
                onClick={() => statement.mutate('pdf')}
              >
                {downloading === 'pdf' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 text-red-500" />
                )}
                PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={rangeInvalid || statement.isPending}
                onClick={() => statement.mutate('xlsx')}
              >
                {downloading === 'xlsx' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                )}
                Excel
              </Button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-500">
              <Download className="mr-1 inline h-3.5 w-3.5" />
              Statements are generated on the server and include every transaction
              in the selected period.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
