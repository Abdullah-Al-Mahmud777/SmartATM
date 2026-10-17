import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const bdt = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

export const CURRENCY = '৳';

export function formatCurrency(value: number): string {
  if (value === null || value === undefined || Number.isNaN(value)) return `${CURRENCY}0`;
  return `${CURRENCY}${bdt.format(Math.round(value))}`;
}

export function formatCompact(value: number): string {
  if (value === null || value === undefined || Number.isNaN(value)) return `${CURRENCY}0`;
  const abs = Math.abs(value);
  if (abs >= 10000000) return `${CURRENCY}${(value / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `${CURRENCY}${(value / 100000).toFixed(2)}L`;
  if (abs >= 1000) return `${CURRENCY}${(value / 1000).toFixed(1)}K`;
  return `${CURRENCY}${value}`;
}

export function formatNumber(value: number): string {
  return bdt.format(value ?? 0);
}

const dhakaDateTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dhaka',
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const dhakaDate = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dhaka',
  year: 'numeric',
  month: 'short',
  day: '2-digit',
});

const dhakaTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dhaka',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

export const formatDateTime = (value: string | Date): string =>
  dhakaDateTime.format(new Date(value));

export const formatDate = (value: string | Date): string =>
  dhakaDate.format(new Date(value));

export const formatTime = (value: string | Date): string =>
  dhakaTime.format(new Date(value));

export function timeAgo(value: string | Date): string {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const titleCase = (value: string): string =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
