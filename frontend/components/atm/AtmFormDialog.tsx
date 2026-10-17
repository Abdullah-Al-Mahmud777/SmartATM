'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { useCreateAtm, useUpdateAtm } from '@/hooks/useApi';
import type { Atm, AtmStatus } from '@/lib/types';
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

const EMPTY = {
  atmId: '',
  name: '',
  area: '',
  address: '',
  lat: '23.8103',
  lng: '90.4125',
  status: 'online' as AtmStatus,
  cash: '500000',
  capacity: '2000000',
};

export function AtmFormDialog({
  open,
  onOpenChange,
  atm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  atm?: Atm | null;
}) {
  const create = useCreateAtm();
  const update = useUpdateAtm();
  const [form, setForm] = React.useState(EMPTY);

  React.useEffect(() => {
    if (atm) {
      setForm({
        atmId: atm.atmId,
        name: atm.name,
        area: atm.area,
        address: atm.location.address,
        lat: String(atm.location.lat),
        lng: String(atm.location.lng),
        status: atm.status,
        cash: String(atm.cash),
        capacity: String(atm.capacity),
      });
    } else {
      setForm(EMPTY);
    }
  }, [atm, open]);

  const pending = create.isPending || update.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      atmId: form.atmId,
      name: form.name,
      area: form.area,
      location: {
        lat: Number(form.lat),
        lng: Number(form.lng),
        address: form.address,
      },
      status: form.status,
      cash: Number(form.cash),
      capacity: Number(form.capacity),
    };
    const onSuccess = () => onOpenChange(false);
    if (atm) {
      update.mutate({ id: atm._id, payload }, { onSuccess });
    } else {
      create.mutate(payload, { onSuccess });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{atm ? 'Edit ATM' : 'Add New ATM'}</DialogTitle>
          <DialogDescription>
            {atm ? `Update details for ${atm.atmId}` : 'Register a new ATM in the network.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>ATM ID</Label>
            <Input
              value={form.atmId}
              onChange={(e) => setForm({ ...form, atmId: e.target.value })}
              placeholder="ATM-DHK-049"
              required
              disabled={Boolean(atm)}
            />
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Gulshan Avenue ATM"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Area</Label>
            <Input
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              placeholder="Gulshan"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as AtmStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Gulshan Avenue, Gulshan, Dhaka"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Latitude</Label>
            <Input
              type="number"
              step="any"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Longitude</Label>
            <Input
              type="number"
              step="any"
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Cash (৳)</Label>
            <Input
              type="number"
              value={form.cash}
              onChange={(e) => setForm({ ...form, cash: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Capacity (৳)</Label>
            <Input
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              required
            />
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {atm ? 'Save changes' : 'Create ATM'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
