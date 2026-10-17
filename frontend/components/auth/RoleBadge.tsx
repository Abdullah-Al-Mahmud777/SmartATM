import * as React from 'react';
import { cn } from '@/lib/utils';
import { ROLES, type RoleKey } from '@/lib/roles';

/** Small pill that identifies which portal is being used. */
export function RoleBadge({
  role,
  className,
}: {
  role: RoleKey;
  className?: string;
}) {
  const meta = ROLES[role];
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        className
      )}
      style={{
        color: meta.color,
        borderColor: `${meta.color}33`,
        backgroundColor: `${meta.color}14`,
      }}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.badge}
    </span>
  );
}
