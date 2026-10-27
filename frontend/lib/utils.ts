import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CURRENCY = '৳';

const amountFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const wholeFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

export function formatMoney(paisa: number): string {
  if (!Number.isFinite(paisa)) return `${CURRENCY}0.00`;
  return `${CURRENCY}${amountFormatter.format(paisa / 100)}`;
}

export function formatMoneyWhole(paisa: number): string {
  if (!Number.isFinite(paisa)) return `${CURRENCY}0`;
  return `${CURRENCY}${wholeFormatter.format(Math.round(paisa / 100))}`;
}

export function formatCompactMoney(paisa: number): string {
  if (!Number.isFinite(paisa)) return `${CURRENCY}0`;
  const value = paisa / 100;
  const abs = Math.abs(value);
  if (abs >= 10_000_000) return `${CURRENCY}${(value / 10_000_000).toFixed(2)}Cr`;
  if (abs >= 100_000) return `${CURRENCY}${(value / 100_000).toFixed(2)}L`;
  if (abs >= 1_000) return `${CURRENCY}${(value / 1_000).toFixed(1)}K`;
  return `${CURRENCY}${value.toFixed(0)}`;
}

export function formatForeignMoney(paisa: number, currency: string): string {
  if (!Number.isFinite(paisa)) return `${currency}0.00`;
  const amount = (paisa / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${amount}`;
}

export function toPaisa(taka: string | number): number {
  const value = typeof taka === 'number' ? taka : Number(taka);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
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
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

export const titleCase = (value: string): string =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  return `${accountNumber.slice(0, 4)} •••• ${accountNumber.slice(-4)}`;
}

export function formatTimeLeft(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
