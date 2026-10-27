import { LockKeyhole, ShieldCheck, Sparkles, WalletCards } from 'lucide-react';
import { Brand } from '@/components/brand';

const highlights = [
  {
    icon: WalletCards,
    title: 'Every account in one view',
    description: 'Live balances, recent activity and statements across your accounts.',
  },
  {
    icon: ShieldCheck,
    title: 'Security by default',
    description: 'Encrypted sessions, CSRF protection and automatic lockout.',
  },
  {
    icon: LockKeyhole,
    title: 'Private to you',
    description: 'A customer-only portal with no shared or administrative access.',
  },
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#07182e] px-12 py-10 text-white lg:flex lg:flex-col xl:px-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 15%, rgba(56,189,248,0.24), transparent 32%), radial-gradient(circle at 85% 10%, rgba(59,130,246,0.28), transparent 36%), radial-gradient(circle at 50% 105%, rgba(99,102,241,0.22), transparent 45%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)',
            backgroundSize: '46px 46px',
          }}
        />

        <div className="relative z-10">
          <Brand theme="dark" />
        </div>

        <div className="relative z-10 my-auto max-w-lg py-14">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-medium text-sky-100 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Simple, secure everyday banking
          </div>
          <h1 className="text-4xl font-bold leading-[1.12] tracking-tight xl:text-[2.9rem]">
            Your money, clearly in view.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-300">
            Sign in to check balances, follow every transaction and download
            statements — all from one calm, focused place.
          </p>

          <div className="mt-10 space-y-5">
            {highlights.map((item) => (
              <div key={item.title} className="flex gap-3.5">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]">
                  <item.icon className="h-4 w-4 text-sky-300" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <div className="mt-1 text-sm leading-relaxed text-slate-400">
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-400/80" />
          MongoDB Atlas-backed · Customer-only access
        </div>
      </aside>

      <main className="relative flex min-h-screen items-center justify-center bg-[#f6f8fc] px-5 py-10 sm:px-10">
        <div className="absolute left-5 top-6 lg:hidden">
          <Brand theme="light" />
        </div>
        <div className="w-full max-w-md animate-auth-fade-up pt-12 lg:pt-0">
          {children}
          <p className="mt-8 text-center text-xs text-slate-400">
            SmartBank demo environment · Never share your password or PIN.
          </p>
        </div>
      </main>
    </div>
  );
}
