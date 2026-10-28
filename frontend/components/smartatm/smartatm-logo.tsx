export function SmartAtmLogo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <svg
          aria-hidden="true"
          viewBox="0 0 48 48"
          className="h-11 w-11 shrink-0 drop-shadow-sm sm:h-12 sm:w-12"
        >
          <defs>
            <linearGradient
              id="smartatm-hex-gradient"
              x1="7"
              y1="5"
              x2="41"
              y2="43"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="currentColor" className="text-brand-blue" />
              <stop offset="100%" stopColor="currentColor" className="text-brand-green" />
            </linearGradient>
            <linearGradient
              id="smartatm-chip-gradient"
              x1="18"
              y1="18"
              x2="30"
              y2="30"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="currentColor" className="text-brand-blue" />
              <stop offset="100%" stopColor="currentColor" className="text-brand-green" />
            </linearGradient>
          </defs>

          <path
            d="M24 3.25 42 12.9v18.2L24 44.75 6 31.1V12.9L24 3.25Z"
            fill="url(#smartatm-hex-gradient)"
            stroke="url(#smartatm-hex-gradient)"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />

          <rect
            x="16.5"
            y="16.5"
            width="15"
            height="15"
            rx="3"
            fill="currentColor"
            fillOpacity="0.96"
            className="text-white"
          />
          <path
            d="M21 21.5h6M21 24h6M21 26.5h6M24 21.5v5"
            stroke="url(#smartatm-chip-gradient)"
            strokeLinecap="round"
            strokeWidth="1.3"
          />

          <path
            d="M16.5 20.5H13M16.5 24H13M16.5 27.5H13M31.5 20.5H35M31.5 24H35M31.5 27.5H35M20.5 16.5V13M24 16.5V13M27.5 16.5V13M20.5 31.5V35M24 31.5V35M27.5 31.5V35"
            stroke="currentColor"
            className="text-white"
            strokeLinecap="round"
            strokeWidth="1.3"
          />
        </svg>

        <div className="text-left leading-none">
          <div className="text-[25px] font-extrabold tracking-[-0.04em] text-navy sm:text-[27px]">
            SM<span className="bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">A</span>RTATM
          </div>
          <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Secure Online Banking
          </div>
        </div>
      </div>
    </div>
  );
}
