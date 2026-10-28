import { LockKeyhole } from 'lucide-react';

export function SecurityBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-brand-green/25 bg-brand-green/10 px-3.5 py-1.5 text-[11px] font-semibold text-brand-green sm:text-xs">
      <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
      <span>
        Secure <span className="px-0.5 text-brand-green/60">•</span> 256-bit SSL Encrypted
      </span>
    </div>
  );
}
