import { KeyRound } from 'lucide-react';
import {
  SMARTATM_DEMO_EMAIL,
  SMARTATM_DEMO_PASSWORD,
} from '@/lib/smartatm-demo';

export function DemoCredentials() {
  return (
    <div className="mt-4 rounded-xl border border-field-border bg-field/70 px-4 py-3.5 text-left">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        <KeyRound className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
        Demo credentials
      </div>
      <dl className="mt-2.5 grid gap-1.5 text-xs">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-500">Email</dt>
          <dd className="font-mono font-semibold text-navy">{SMARTATM_DEMO_EMAIL}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-500">Password</dt>
          <dd className="font-mono font-semibold text-navy">{SMARTATM_DEMO_PASSWORD}</dd>
        </div>
      </dl>
    </div>
  );
}
