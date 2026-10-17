import {
  LayoutDashboard,
  Network,
  ArrowLeftRight,
  Wallet,
  BellRing,
  BarChart3,
  Users,
  Settings as SettingsIcon,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from './types';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'manager', 'operator'],
  },
  {
    label: 'ATM Monitoring',
    href: '/atm-monitoring',
    icon: Network,
    roles: ['admin', 'manager', 'operator'],
  },
  {
    label: 'Transactions',
    href: '/transactions',
    icon: ArrowLeftRight,
    roles: ['admin', 'manager', 'operator'],
  },
  {
    label: 'Cash Management',
    href: '/cash-management',
    icon: Wallet,
    roles: ['admin', 'manager', 'operator'],
  },
  {
    label: 'Alerts',
    href: '/alerts',
    icon: BellRing,
    roles: ['admin', 'manager', 'operator'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['admin', 'manager'],
  },
  {
    label: 'Users',
    href: '/users',
    icon: Users,
    roles: ['admin', 'manager'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: SettingsIcon,
    roles: ['admin'],
  },
];

export const navForRole = (role?: UserRole): NavItem[] =>
  role ? NAV_ITEMS.filter((item) => item.roles.includes(role)) : [];
