'use client';

import * as React from 'react';
import { Building2, Globe2, Loader2, SlidersHorizontal, Save } from 'lucide-react';
import { useSettings, useUpdateSettings } from '@/hooks/useApi';
import type { Settings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorState } from '@/components/shared/states';

export default function SettingsPage() {
  const { data, isLoading, isError, refetch } = useSettings();
  const update = useUpdateSettings();
  const [form, setForm] = React.useState<Settings | null>(null);

  React.useEffect(() => {
    if (data?.data) setForm(data.data);
  }, [data]);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const {
      orgName,
      currency,
      currencySymbol,
      timezone,
      lowCashThreshold,
      criticalCashThreshold,
      refreshInterval,
      alertEmail,
      maintenanceMode,
    } = form;
    update.mutate({
      orgName,
      currency,
      currencySymbol,
      timezone,
      lowCashThreshold,
      criticalCashThreshold,
      refreshInterval,
      alertEmail,
      maintenanceMode,
    });
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" />
        <ErrorState message="Could not load settings." onRetry={() => refetch()} />
      </div>
    );
  }

  if (isLoading || !form) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure network defaults and thresholds" />

      <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input
                value={form.orgName}
                onChange={(e) => set('orgName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Alert Email</Label>
              <Input
                type="email"
                value={form.alertEmail}
                onChange={(e) => set('alertEmail', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Globe2 className="h-5 w-5 text-primary" />
            <CardTitle>Regional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={form.currency} onChange={(e) => set('currency', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Symbol</Label>
                <Input
                  value={form.currencySymbol}
                  onChange={(e) => set('currencySymbol', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input value={form.timezone} onChange={(e) => set('timezone', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <CardTitle>Cash Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Low Cash Threshold (৳)</Label>
              <Input
                type="number"
                value={form.lowCashThreshold}
                onChange={(e) => set('lowCashThreshold', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Critical Threshold (৳)</Label>
              <Input
                type="number"
                value={form.criticalCashThreshold}
                onChange={(e) => set('criticalCashThreshold', Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <CardTitle>System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Auto-refresh Interval (seconds)</Label>
              <Input
                type="number"
                min={5}
                max={600}
                value={form.refreshInterval}
                onChange={(e) => set('refreshInterval', Number(e.target.value))}
              />
            </div>
            <label className="flex items-center gap-3 rounded-lg border p-3">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[hsl(var(--primary))]"
                checked={form.maintenanceMode}
                onChange={(e) => set('maintenanceMode', e.target.checked)}
              />
              <span>
                <span className="block text-sm font-medium">Maintenance Mode</span>
                <span className="block text-xs text-muted-foreground">
                  Pause transaction processing network-wide
                </span>
              </span>
            </label>
          </CardContent>
        </Card>

        <div className="xl:col-span-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save settings
          </Button>
        </div>
      </form>
    </div>
  );
}
