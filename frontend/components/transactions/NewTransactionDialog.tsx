'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { useAtms, useCreateTransaction } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
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

const TYPES = [
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'balance_inquiry', label: 'Balance Inquiry' },
  { value: 'transfer', label: 'Transfer' },
];

export function NewTransactionDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data } = useAtms({ limit: 200, status: 'online' });
  const atms = data?.data ?? [];
  const create = useCreateTransaction();

  const [atm, setAtm] = React.useState('');
  const [type, setType] = React.useState('withdrawal');
  const [amount, setAmount] = React.useState('5000');
  const [customer, setCustomer] = React.useState('');

  React.useEffect(() => {
    if (open && atms.length && !atm) setAtm(atms[0]._id);
  }, [open, atms, atm]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      {
        atm,
        type,
        amount: type === 'balance_inquiry' ? 0 : Number(amount),
        customerName: customer || 'Walk-in Customer',
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
          <DialogDescription>
            Simulate a transaction on an online ATM. Withdrawals deduct cash.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>ATM</Label>
            <Select value={atm} onValueChange={setAtm}>
              <SelectTrigger>
                <SelectValue placeholder="Select ATM" />
              </SelectTrigger>
              <SelectContent>
                {atms.map((a) => (
                  <SelectItem key={a._id} value={a._id}>
                    {a.atmId} · {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (৳)</Label>
              <Input
                type="number"
                step="500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={type === 'balance_inquiry'}
                required={type !== 'balance_inquiry'}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Customer Name</Label>
            <Input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending || !atm}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
