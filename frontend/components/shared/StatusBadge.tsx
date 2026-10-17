import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Variant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info'
  | 'muted'
  | 'danger';

const ATM_STATUS: Record<string, { label: string; variant: Variant }> = {
  online: { label: 'Online', variant: 'success' },
  offline: { label: 'Offline', variant: 'danger' },
  maintenance: { label: 'Maintenance', variant: 'warning' },
};

const TXN_STATUS: Record<string, { label: string; variant: Variant }> = {
  success: { label: 'Success', variant: 'success' },
  failed: { label: 'Failed', variant: 'danger' },
  pending: { label: 'Pending', variant: 'warning' },
};

const SEVERITY: Record<string, { label: string; variant: Variant }> = {
  low: { label: 'Low', variant: 'info' },
  medium: { label: 'Medium', variant: 'warning' },
  high: { label: 'High', variant: 'danger' },
  critical: { label: 'Critical', variant: 'destructive' },
};

const ALERT_STATUS: Record<string, { label: string; variant: Variant }> = {
  active: { label: 'Active', variant: 'danger' },
  acknowledged: { label: 'Acknowledged', variant: 'warning' },
  resolved: { label: 'Resolved', variant: 'success' },
};

const USER_ROLE: Record<string, { label: string; variant: Variant }> = {
  admin: { label: 'Admin', variant: 'default' },
  manager: { label: 'Manager', variant: 'info' },
  operator: { label: 'Operator', variant: 'muted' },
};

const USER_STATUS: Record<string, { label: string; variant: Variant }> = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'muted' },
  suspended: { label: 'Suspended', variant: 'danger' },
};

const MAPS = {
  atm: ATM_STATUS,
  transaction: TXN_STATUS,
  severity: SEVERITY,
  alert: ALERT_STATUS,
  role: USER_ROLE,
  user: USER_STATUS,
} as const;

export type BadgeKind = keyof typeof MAPS;

export function StatusBadge({
  kind,
  value,
  className,
}: {
  kind: BadgeKind;
  value: string;
  className?: string;
}) {
  const entry = MAPS[kind][value] ?? {
    label: value,
    variant: 'muted' as Variant,
  };
  return (
    <Badge variant={entry.variant} className={cn('capitalize', className)}>
      {entry.label}
    </Badge>
  );
}
