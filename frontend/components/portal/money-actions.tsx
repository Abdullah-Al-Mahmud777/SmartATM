'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowRightLeft,
  ArrowUpFromLine,
  Loader2,
  LockKeyhole,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiGet, apiPost, createIdempotencyKey, getErrorMessage } from '@/lib/api';
import type {
  Account,
  ExchangeRates,
  ExchangeResult,
  MoneyMovement,
  TransferResult,
} from '@/lib/types';
import {
  formatForeignMoney,
  formatMoney,
  maskAccountNumber,
  titleCase,
  toPaisa,
} from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormAlert } from '@/components/auth/form-alert';
import { PasswordInput } from '@/components/auth/password-input';

type Action = 'deposit' | 'withdraw' | 'transfer' | 'exchange';

function useMoneyRefresh() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    void queryClient.invalidateQueries({ queryKey: ['me'] });
    void queryClient.invalidateQueries({ queryKey: ['transactions'] });
    void queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };
}

function accountLabel(account: Account) {
  return `${titleCase(account.accountType)} · ${maskAccountNumber(
    account.accountNumber
  )} · ${formatMoney(account.availableBalancePaisa)}`;
}

function ActionButton({
  icon: Icon,
  label,
  hint,
  onClick,
  disabled,
}: {
  icon: typeof ArrowDownToLine;
  label: string;
  hint: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-auto justify-start gap-3 px-3 py-3 text-left"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="mt-0.5 block whitespace-normal text-[11px] font-normal leading-snug text-slate-500">
          {hint}
        </span>
      </span>
    </Button>
  );
}

export function MoneyActions({ accounts }: { accounts: Account[] }) {
  const [action, setAction] = useState<Action | null>(null);
  const activeAccounts = accounts.filter((account) => account.status === 'active');
  const primaryAccount =
    activeAccounts.find((account) => account.isPrimary) ?? activeAccounts[0] ?? null;

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <CardTitle>Quick actions</CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Deposit, withdraw, exchange or move money between your own SmartBank
                accounts.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <LockKeyhole className="h-3.5 w-3.5" />
              PIN protected
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <ActionButton
              icon={ArrowDownToLine}
              label="Deposit"
              hint="Add funds to your primary account"
              onClick={() => setAction('deposit')}
              disabled={!primaryAccount}
            />
            <ActionButton
              icon={ArrowUpFromLine}
              label="Withdraw"
              hint="Withdraw with a 2-minute cancel window"
              onClick={() => setAction('withdraw')}
              disabled={!primaryAccount}
            />
            <ActionButton
              icon={ArrowRightLeft}
              label="Exchange"
              hint="Convert BDT into foreign currency"
              onClick={() => setAction('exchange')}
              disabled={!primaryAccount}
            />
            <ActionButton
              icon={ArrowLeftRight}
              label="Transfer"
              hint={
                activeAccounts.length > 1
                  ? 'Move funds between your own accounts'
                  : 'You need another active account'
              }
              onClick={() => setAction('transfer')}
              disabled={activeAccounts.length < 2}
            />
          </div>
          {primaryAccount && (
            <p className="mt-3 text-[11px] text-slate-500">
              Deposits and withdrawals use your primary account ending{' '}
              <span className="font-mono font-medium text-slate-700">
                {primaryAccount.accountNumber.slice(-4)}
              </span>
              .
            </p>
          )}
        </CardContent>
      </Card>

      <DepositDialog
        open={action === 'deposit'}
        onOpenChange={(open) => setAction(open ? 'deposit' : null)}
        account={primaryAccount}
      />
      <WithdrawDialog
        open={action === 'withdraw'}
        onOpenChange={(open) => setAction(open ? 'withdraw' : null)}
        account={primaryAccount}
      />
      <TransferDialog
        open={action === 'transfer'}
        onOpenChange={(open) => setAction(open ? 'transfer' : null)}
        accounts={activeAccounts}
      />
      <ExchangeDialog
        open={action === 'exchange'}
        onOpenChange={(open) => setAction(open ? 'exchange' : null)}
        account={primaryAccount}
      />
    </>
  );
}

function DepositDialog({
  open,
  onOpenChange,
  account,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
}) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const refresh = useMoneyRefresh();

  const deposit = useMutation({
    mutationFn: (input: { amountPaisa: number; note?: string }) =>
      apiPost<MoneyMovement>('/deposit', input, {
        headers: { 'Idempotency-Key': createIdempotencyKey() },
      }),
    onSuccess: (response) => {
      toast.success(response.message);
      refresh();
      setAmount('');
      setNote('');
      setError(null);
      onOpenChange(false);
    },
    onError: (mutationError) => setError(getErrorMessage(mutationError)),
  });

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amountPaisa = toPaisa(amount);
    if (amountPaisa <= 0) {
      setError('Enter a valid amount greater than zero.');
      return;
    }
    setError(null);
    deposit.mutate({
      amountPaisa,
      ...(note.trim() ? { note: note.trim() } : {}),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit funds</DialogTitle>
          <DialogDescription>
            Add money to your primary account ending{' '}
            {account ? account.accountNumber.slice(-4) : '—'}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {error && <FormAlert>{error}</FormAlert>}
          <div className="space-y-1.5">
            <Label htmlFor="deposit-amount">Amount (৳)</Label>
            <Input
              id="deposit-amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deposit-note">Note (optional)</Label>
            <Input
              id="deposit-note"
              maxLength={200}
              placeholder="e.g. Monthly savings"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={deposit.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={deposit.isPending || !account}>
              {deposit.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Depositing...
                </>
              ) : (
                'Deposit'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function WithdrawDialog({
  open,
  onOpenChange,
  account,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
}) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const refresh = useMoneyRefresh();

  const withdraw = useMutation({
    mutationFn: (input: {
      amountPaisa: number;
      note?: string;
      transactionPin: string;
    }) =>
      apiPost<MoneyMovement>('/withdraw', input, {
        headers: { 'Idempotency-Key': createIdempotencyKey() },
      }),
    onSuccess: (response) => {
      toast.success(response.message);
      refresh();
      setAmount('');
      setNote('');
      setPin('');
      setError(null);
      onOpenChange(false);
    },
    onError: (mutationError) => setError(getErrorMessage(mutationError)),
  });

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amountPaisa = toPaisa(amount);
    if (amountPaisa <= 0) {
      setError('Enter a valid amount greater than zero.');
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      setError('Enter your 4 to 6 digit transaction PIN.');
      return;
    }
    setError(null);
    withdraw.mutate({
      amountPaisa,
      transactionPin: pin,
      ...(note.trim() ? { note: note.trim() } : {}),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw funds</DialogTitle>
          <DialogDescription>
            Withdrawals are held as pending for a short window and can be cancelled
            from your recent activity.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {error && <FormAlert>{error}</FormAlert>}
          <div className="space-y-1.5">
            <Label htmlFor="withdraw-amount">Amount (৳)</Label>
            <Input
              id="withdraw-amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              autoFocus
            />
            {account && (
              <p className="text-[11px] text-slate-500">
                Available: {formatMoney(account.availableBalancePaisa)}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="withdraw-pin">Transaction PIN</Label>
            <PasswordInput
              id="withdraw-pin"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              placeholder="4 to 6 digits"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="withdraw-note">Note (optional)</Label>
            <Input
              id="withdraw-note"
              maxLength={200}
              placeholder="e.g. Cash withdrawal"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={withdraw.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={withdraw.isPending || !account}>
              {withdraw.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                'Withdraw'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TransferDialog({
  open,
  onOpenChange,
  accounts,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
}) {
  const initialFrom =
    accounts.find((account) => account.isPrimary) ?? accounts[0] ?? null;
  const [fromId, setFromId] = useState(initialFrom?.id ?? '');
  const [toId, setToId] = useState(
    accounts.find((account) => account.id !== initialFrom?.id)?.id ?? ''
  );
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const refresh = useMoneyRefresh();

  const fromAccount =
    accounts.find((account) => account.id === fromId) ??
    accounts.find((account) => account.isPrimary) ??
    accounts[0] ??
    null;
  const toAccount =
    accounts.find(
      (account) => account.id === toId && account.id !== fromAccount?.id
    ) ??
    accounts.find((account) => account.id !== fromAccount?.id) ??
    null;
  const destinations = accounts.filter(
    (account) => account.id !== fromAccount?.id
  );

  const transfer = useMutation({
    mutationFn: (input: {
      fromAccountId: string;
      toAccountId: string;
      amountPaisa: number;
      note?: string;
      transactionPin: string;
    }) =>
      apiPost<TransferResult>('/transfer', input, {
        headers: { 'Idempotency-Key': createIdempotencyKey() },
      }),
    onSuccess: (response) => {
      toast.success(response.message);
      refresh();
      setAmount('');
      setNote('');
      setPin('');
      setError(null);
      onOpenChange(false);
    },
    onError: (mutationError) => setError(getErrorMessage(mutationError)),
  });

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fromAccount || !toAccount) {
      setError('Choose a source and destination account.');
      return;
    }
    const amountPaisa = toPaisa(amount);
    if (amountPaisa <= 0) {
      setError('Enter a valid amount greater than zero.');
      return;
    }
    if (amountPaisa > fromAccount.availableBalancePaisa) {
      setError(
        `Amount exceeds the available balance of ${formatMoney(
          fromAccount.availableBalancePaisa
        )}.`
      );
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      setError('Enter your 4 to 6 digit transaction PIN.');
      return;
    }
    setError(null);
    transfer.mutate({
      fromAccountId: fromAccount.id,
      toAccountId: toAccount.id,
      amountPaisa,
      transactionPin: pin,
      ...(note.trim() ? { note: note.trim() } : {}),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer between accounts</DialogTitle>
          <DialogDescription>
            Move money instantly between your own SmartBank accounts. Both accounts
            must be active.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {error && <FormAlert>{error}</FormAlert>}
          <div className="space-y-1.5">
            <Label htmlFor="transfer-from">From account</Label>
            <Select
              value={fromAccount?.id}
              onValueChange={(value) => {
                setFromId(value);
                if (toAccount?.id === value) {
                  setToId(
                    accounts.find((account) => account.id !== value)?.id ?? ''
                  );
                }
              }}
            >
              <SelectTrigger id="transfer-from">
                <SelectValue placeholder="Choose an account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {accountLabel(account)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transfer-to">To account</Label>
            <Select
              value={toAccount?.id}
              onValueChange={setToId}
              disabled={destinations.length === 0}
            >
              <SelectTrigger id="transfer-to">
                <SelectValue placeholder="Choose a destination" />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {accountLabel(account)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transfer-amount">Amount (৳)</Label>
            <Input
              id="transfer-amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            {fromAccount && (
              <p className="text-[11px] text-slate-500">
                Available in source: {formatMoney(fromAccount.availableBalancePaisa)}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transfer-pin">Transaction PIN</Label>
            <PasswordInput
              id="transfer-pin"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              placeholder="4 to 6 digits"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transfer-note">Note (optional)</Label>
            <Input
              id="transfer-note"
              maxLength={200}
              placeholder="e.g. Move to savings"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={transfer.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={transfer.isPending || !fromAccount || !toAccount}
            >
              {transfer.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Transferring...
                </>
              ) : (
                'Transfer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ExchangeDialog({
  open,
  onOpenChange,
  account,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
}) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const refresh = useMoneyRefresh();

  const ratesQuery = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: () =>
      apiGet<ExchangeRates>('/exchange/rates').then((response) => response.data),
  });

  const currencies = ratesQuery.data?.rates
    ? Object.keys(ratesQuery.data.rates)
    : ['USD'];
  const selectedCurrency = currencies.includes(currency) ? currency : currencies[0];
  const rate = ratesQuery.data?.rates?.[selectedCurrency ?? ''] ?? 0;
  const amountPaisaPreview =
    selectedCurrency && rate > 0 ? Math.round(toPaisa(amount) * rate) : 0;

  const exchange = useMutation({
    mutationFn: (input: {
      amountPaisa: number;
      currency: string;
      transactionPin: string;
    }) =>
      apiPost<ExchangeResult>('/exchange', input, {
        headers: { 'Idempotency-Key': createIdempotencyKey() },
      }),
    onSuccess: (response) => {
      toast.success(response.message);
      refresh();
      setAmount('');
      setPin('');
      setError(null);
      onOpenChange(false);
    },
    onError: (mutationError) => setError(getErrorMessage(mutationError)),
  });

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amountPaisa = toPaisa(amount);
    if (amountPaisa <= 0) {
      setError('Enter a valid amount greater than zero.');
      return;
    }
    if (!selectedCurrency) {
      setError('Choose a currency to exchange into.');
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      setError('Enter your 4 to 6 digit transaction PIN.');
      return;
    }
    setError(null);
    exchange.mutate({
      amountPaisa,
      currency: selectedCurrency,
      transactionPin: pin,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exchange money</DialogTitle>
          <DialogDescription>
            Convert BDT from your account into a foreign currency at the bank exchange
            rate.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {error && <FormAlert>{error}</FormAlert>}
          <div className="space-y-1.5">
            <Label htmlFor="exchange-amount">Amount (৳)</Label>
            <Input
              id="exchange-amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              autoFocus
            />
            {account && (
              <p className="text-[11px] text-slate-500">
                Available: {formatMoney(account.availableBalancePaisa)}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exchange-currency">Currency</Label>
            <Select value={selectedCurrency} onValueChange={setCurrency}>
              <SelectTrigger id="exchange-currency">
                <SelectValue placeholder="Choose a currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCurrency && rate > 0 && amountPaisaPreview > 0 && (
              <p className="text-[11px] text-slate-500">
                Bank rate: 1 BDT = {rate} {selectedCurrency} · You will receive{' '}
                {formatForeignMoney(amountPaisaPreview, selectedCurrency)}.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exchange-pin">Transaction PIN</Label>
            <PasswordInput
              id="exchange-pin"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              placeholder="4 to 6 digits"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={exchange.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={exchange.isPending || !account}>
              {exchange.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exchanging...
                </>
              ) : (
                'Exchange'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
