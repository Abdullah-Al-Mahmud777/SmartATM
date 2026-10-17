import { BarChart3, ShieldCheck, Wrench, type LucideIcon } from 'lucide-react';

export type RoleKey = 'admin' | 'manager' | 'operator';

export interface RoleMeta {
  key: RoleKey;
  /** Display name used in sentences, e.g. "This account is not an Administrator." */
  label: string;
  /** Short badge label, e.g. "Administrator portal". */
  badge: string;
  /** Copy shown on the "Choose your portal" card and login subtext. */
  description: string;
  /** Solid role color used for borders and accents. */
  color: string;
  gradientFrom: string;
  gradientTo: string;
  icon: LucideIcon;
  /** Demo credentials (only surfaced outside production). */
  demo: { email: string; password: string };
}

export const ROLES: Record<RoleKey, RoleMeta> = {
  admin: {
    key: 'admin',
    label: 'Administrator',
    badge: 'Administrator portal',
    description: 'Manage users, settings and the entire ATM fleet.',
    color: '#7c3aed',
    gradientFrom: '#7c3aed',
    gradientTo: '#4f46e5',
    icon: ShieldCheck,
    demo: { email: 'admin@smartatm.com', password: 'admin123' },
  },
  manager: {
    key: 'manager',
    label: 'Manager',
    badge: 'Manager portal',
    description: 'Track transactions, alerts and cash availability.',
    color: '#2563eb',
    gradientFrom: '#2563eb',
    gradientTo: '#0891b2',
    icon: BarChart3,
    demo: { email: 'manager@smartatm.com', password: 'manager123' },
  },
  operator: {
    key: 'operator',
    label: 'Operator',
    badge: 'Operator portal',
    description: 'Keep ATMs online and refill cash on time.',
    color: '#059669',
    gradientFrom: '#059669',
    gradientTo: '#0d9488',
    icon: Wrench,
    demo: { email: 'operator@smartatm.com', password: 'operator123' },
  },
};

export const ROLE_KEYS: RoleKey[] = ['admin', 'manager', 'operator'];

export const roleGradient = (meta: RoleMeta): string =>
  `linear-gradient(135deg, ${meta.gradientFrom}, ${meta.gradientTo})`;

/** Missing or invalid role values fall back to "admin". */
export function normalizeRole(value?: string | string[] | null): RoleKey {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && (ROLE_KEYS as string[]).includes(raw)) return raw as RoleKey;
  return 'admin';
}
