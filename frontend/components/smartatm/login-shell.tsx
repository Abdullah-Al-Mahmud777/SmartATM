import { ReactNode } from 'react';

export function LoginShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-page px-0 py-8 sm:px-6 sm:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-blob/90 blur-3xl sm:-left-32 sm:-top-40 sm:h-[26rem] sm:w-[26rem]" />
        <div className="absolute -bottom-36 -right-24 h-80 w-80 rounded-full bg-blob/80 blur-3xl sm:-bottom-44 sm:-right-32 sm:h-[30rem] sm:w-[30rem]" />
        <div className="absolute -right-16 top-12 h-56 w-56 rounded-full bg-brand-teal/10 blur-3xl sm:right-0 sm:top-20" />
        <div className="absolute -left-20 bottom-16 h-48 w-48 rounded-full bg-brand-green/10 blur-3xl sm:left-2 sm:bottom-24" />
      </div>

      <div className="relative z-10 w-full max-w-[430px]">{children}</div>
    </div>
  );
}
