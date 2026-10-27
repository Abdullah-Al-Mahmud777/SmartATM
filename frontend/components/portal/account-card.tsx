'use client';

import { Building2, Check, CreditCard } from 'lucide-react';
import type { Account } from '@/lib/types';
import { cn, formatMoney, maskAccountNumber } from '@/lib/utils';

export function AccountCard({
  account,
  selected,
  onSelect,
  allowSelect = false,
}: {
  account: Account;
  selected?: boolean;
  onSelect?: (account: Account) => void;
  allowSelect?: boolean;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-white/70">
          <CreditCard className="h-4 w-4" />
          {account.accountType === 'savings' ? 'Savings account' : 'Current account'}
        </div>
        <div className="flex items-center gap-2">
          {account.isPrimary && (
            <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80">
              Primary
            </span>
          )}
          {selected && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
              <Check className="h-3 w-3 text-white" />
            </span>
          )}
        </div>
      </div>

      <div className="mt-7">
        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
          Available balance
        </div>
        <div className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-[1.7rem]">
          {formatMoney(account.availableBalancePaisa)}
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-sm tracking-wide text-white/85">
            {maskAccountNumber(account.accountNumber)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/55">
            <Building2 className="h-3 w-3" />
            {account.branchName}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wide text-white/45">
            Ledger
          </div>
          <div className="mt-0.5 text-xs font-medium text-white/75">
            {formatMoney(account.balancePaisa)}
          </div>
        </div>
      </div>
    </>
  );

  const className = cn(
    'relative w-full overflow-hidden rounded-2xl border border-white/10 p-5 text-left shadow-lg transition-all',
    account.accountType === 'savings'
      ? 'bg-gradient-to-br from-[#0b2447] via-[#0c2d5b] to-[#123c75]'
      : 'bg-gradient-to-br from-[#173b63] via-[#1d4f86] to-[#2563a8]',
    allowSelect &&
      'cursor-pointer hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    selected && 'ring-2 ring-sky-400 ring-offset-2 ring-offset-[#f6f8fc]'
  );

  const decoration = (
    <>
      <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-16 top-6 h-48 w-48 rounded-full border border-white/[0.07]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 bg-gradient-to-tl from-white/[0.07] to-transparent" />
    </>
  );

  if (allowSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(account)}
        className={className}
        aria-pressed={selected}
      >
        {decoration}
        <div className="relative">{content}</div>
      </button>
    );
  }

  return (
    <div className={className}>
      {decoration}
      <div className="relative">{content}</div>
    </div>
  );
}
