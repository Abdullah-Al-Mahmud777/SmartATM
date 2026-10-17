'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { useRefillAtm } from '@/hooks/useApi';
import type { Atm } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
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

const NOTE_FIELDS = [
  { key: 'thousand', label: '৳1000 notes', value: 1000 },
  { key: 'fiveHundred', label: '৳500 notes', value: 500 },
  { key: 'twoHundred', label: '৳200 notes', value: 200 },
  { key: 'oneHundred', label: '৳100 notes', value: 100 },
  { key: 'fifty', label: '৳50 notes', value: 50 },
] as const;

const initial = {
  thousand: 0,
  fiveHundred: 0,
  twoHundred: 0,
  oneHundred: 0,
  fifty: 0,
};

export function RefillDialog({
  open,
  onOpenChange,
  atm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  atm: Atm | null;
}) {
  const refill = useRefillAtm();
  const [counts, setCounts] = React.useState({ ...initial });
  const [technician, setTechnician] = React.useState('Cash Van');

  React.useEffect(() => {
    if (open) {
      setCounts({ ...initial });
      setTechnician('Cash Van');
    }
  }, [open]);

  const total = NOTE_FIELDS.reduce((sum, f) => sum + (counts[f.key] || 0) * f.value, 0);
  const projected = (atm?.cash ?? 0) + total;
  const overCapacity = atm ? projected > atm.capacity : false;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!atm) return;
    refill.mutate(
      { id: atm._id, denominations: counts, technician },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Refill {atm?.atmId}</DialogTitle>
          <DialogDescription>
            Current cash: {formatCurrency(atm?.cash ?? 0)} · Capacity{' '}
            {formatCurrency(atm?.capacity ?? 0)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {NOTE_FIELDS.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs">{field.label}</Label>
                <Input
                  type="number"
                  min={0}
                  value={counts[field.key]}
                  onChange={(e) =>
                    setCounts({ ...counts, [field.key]: Number(e.target.value) || 0 })
                  }
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-xs">Technician</Label>
              <Input value={technician} onChange={(e) => setTechnician(e.target.value)} />
            </div>
          </div>

          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Refill amount</span>
              <span className="font-semibold">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Projected cash</span>
              <span className={overCapacity ? 'font-semibold text-destructive' : 'font-semibold'}>
                {formatCurrency(projected)}
              </span>
            </div>
            {overCapacity && (
              <p className="mt-1 text-xs text-destructive">
                Exceeds capacity — amount will be capped.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={refill.isPending || total <= 0}>
              {refill.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm refill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
