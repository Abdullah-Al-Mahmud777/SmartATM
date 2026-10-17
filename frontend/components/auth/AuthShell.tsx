import * as React from 'react';
import { Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Full-screen auth layout: soft light-blue gradient, faint decorative
 * network/ATM artwork and the SMARTATM brand lockup. All decoration is
 * hidden below the `sm` breakpoint so the card can breathe on mobile.
 */
export function AuthShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const year = new Date().getFullYear();

  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#f4f8ff] to-[#e8f1ff]',
        className
      )}
    >
      <AuthBackground />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[440px]">
          <BrandLogo />
          <div className="mt-6">{children}</div>
        </div>
      </div>

      <footer className="relative z-10 flex items-center justify-center gap-3 pb-6 text-xs text-slate-400">
        <span className="h-px w-10 bg-slate-300/70" aria-hidden="true" />
        <span>© {year} SmartATM · Dhaka, Bangladesh</span>
        <span className="h-px w-10 bg-slate-300/70" aria-hidden="true" />
      </footer>
    </div>
  );
}

function BrandLogo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] shadow-lg shadow-blue-600/25">
          <Landmark className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#0f172a]">SMART</span>
          <span className="text-[#2563EB]">ATM</span>
        </span>
      </div>
      <span className="h-0.5 w-10 rounded-full bg-[#2563EB]" aria-hidden="true" />
    </div>
  );
}

function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden="true">
      {/* Faint diagonal blue shapes in the corners */}
      <div className="absolute -left-28 -top-28 h-72 w-72 rotate-45 rounded-[3rem] bg-blue-500/[0.07]" />
      <div className="absolute -bottom-32 -right-24 h-80 w-80 -rotate-12 rounded-[4rem] bg-blue-400/[0.07]" />

      {/* Connected-dots network, bottom-left */}
      <svg
        className="absolute bottom-6 left-6 h-48 w-64 text-blue-500/[0.12]"
        viewBox="0 0 260 200"
        fill="none"
      >
        <g stroke="currentColor" strokeWidth="1">
          <line x1="30" y1="150" x2="90" y2="100" />
          <line x1="90" y1="100" x2="150" y2="140" />
          <line x1="150" y1="140" x2="210" y2="70" />
          <line x1="90" y1="100" x2="60" y2="40" />
          <line x1="60" y1="40" x2="150" y2="140" />
          <line x1="210" y1="70" x2="120" y2="30" />
          <line x1="120" y1="30" x2="60" y2="40" />
        </g>
        <g fill="currentColor">
          <circle cx="30" cy="150" r="4" />
          <circle cx="90" cy="100" r="5" />
          <circle cx="150" cy="140" r="4" />
          <circle cx="210" cy="70" r="5" />
          <circle cx="60" cy="40" r="4" />
          <circle cx="120" cy="30" r="4" />
        </g>
      </svg>

      {/* Very light ATM machine line illustration on the right */}
      <svg
        className="absolute right-8 top-1/2 hidden h-[420px] -translate-y-1/2 text-blue-900 lg:block"
        viewBox="0 0 220 380"
        fill="none"
        opacity="0.08"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="40" y="20" width="140" height="340" rx="16" />
        <rect x="62" y="48" width="96" height="70" rx="8" />
        <text x="110" y="92" textAnchor="middle" fontSize="22" fill="currentColor" stroke="none" fontFamily="Inter, sans-serif">
          ATM
        </text>
        <rect x="62" y="140" width="96" height="30" rx="6" />
        <line x1="80" y1="155" x2="140" y2="155" />
        <rect x="62" y="196" width="96" height="34" rx="6" />
        <g>
          <rect x="74" y="206" width="20" height="14" rx="3" />
          <rect x="100" y="206" width="20" height="14" rx="3" />
          <rect x="126" y="206" width="20" height="14" rx="3" />
        </g>
        <rect x="74" y="256" width="72" height="10" rx="3" />
        <rect x="74" y="286" width="72" height="26" rx="4" />
        <circle cx="110" cy="330" r="10" />
      </svg>
    </div>
  );
}
