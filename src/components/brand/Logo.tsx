import { BMA_MARK } from "./paths";

const S = 128;
const x = (S - BMA_MARK.width) / 2;
const y = S / 2 + BMA_MARK.cap / 2 - 5;

/** Plaque BMA — monogramme évidé, barre de calandre en dessous */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className={className} aria-hidden>
      <defs>
        <linearGradient id="bma-plate" x1=".05" y1="0" x2=".95" y2="1">
          <stop offset="0" stopColor="#3AA5F5" />
          <stop offset="1" stopColor="#08356B" />
        </linearGradient>
        <mask id="bma-cut" maskUnits="userSpaceOnUse" x="0" y="0" width={S} height={S}>
          <rect width={S} height={S} fill="#fff" />
          <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`}>
            <path d={BMA_MARK.d} fill="#000" />
          </g>
          <rect x={(S - 62) / 2} y={y + 9} width="62" height="5" rx="2.5" fill="#000" />
        </mask>
      </defs>
      <rect width={S} height={S} rx="29" fill="url(#bma-plate)" mask="url(#bma-cut)" />
    </svg>
  );
}

/** Verrou logo complet : plaque + BMA + AUTOMOBILE */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-[10px]">
      <LogoMark className="w-[38px] h-[38px] shrink-0 transition-transform duration-500 group-hover/logo:scale-[1.07] group-hover/logo:-rotate-3" />
      {!compact && (
        <span className="leading-none">
          <b className="block text-[17px] font-bold tracking-[.06em]">BMA</b>
          <i className="block not-italic text-[7px] font-medium tracking-[.36em] mt-[3px]" style={{ color: "var(--brand)" }}>
            AUTOMOBILE
          </i>
        </span>
      )}
    </span>
  );
}
