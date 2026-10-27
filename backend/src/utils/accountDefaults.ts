import { Types } from 'mongoose';

export const DEFAULT_BRANCH = {
  code: 'DHK-DHN',
  name: 'Dhanmondi Branch',
} as const;

export function generateAccountNumber(userId: Types.ObjectId): string {
  const suffix = BigInt(`0x${userId.toHexString().slice(-12)}`) % 100_000_000n;
  return `10${suffix.toString().padStart(8, '0')}`;
}

export function generateCustomerRef(userId: Types.ObjectId): string {
  return `CUST-${userId.toHexString().slice(-8).toUpperCase()}`;
}
