import { BMA_SEAL_MARK, SEAL_ARC_BOTTOM, SEAL_ARC_TOP, SEAL_CAR } from "./paths";

const x = 130 - BMA_SEAL_MARK.width / 2;
const y = 130 + BMA_SEAL_MARK.cap / 2 - 8;

/** Sceau de la maison — utilisé sur les zones de confiance */
export function Seal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 260" className={className} aria-hidden>
      <defs>
        <linearGradient id="bma-seal" x1=".1" y1="0" x2=".9" y2="1">
          <stop offset="0" stopColor="#2A83E8" />
          <stop offset=".55" stopColor="#0E4C92" />
          <stop offset="1" stopColor="#06203F" />
        </linearGradient>
      </defs>
      <circle cx="130" cy="130" r="126" fill="url(#bma-seal)" />
      <circle cx="130" cy="130" r="126" fill="none" stroke="#8AD6FF" strokeWidth="2" opacity=".5" />
      <circle cx="130" cy="130" r="92" fill="none" stroke="#8AD6FF" strokeWidth="1.4" opacity=".34" />
      <g dangerouslySetInnerHTML={{ __html: SEAL_ARC_TOP.replaceAll("CURRENT", "#FFFFFF") }} />
      <g dangerouslySetInnerHTML={{ __html: SEAL_ARC_BOTTOM.replaceAll("CURRENT", "#8AD6FF") }} />
      <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`}>
        <path d={BMA_SEAL_MARK.d} fill="#FFFFFF" />
      </g>
      <g transform="translate(97,152) scale(.30)" fill="none" stroke="#8AD6FF" strokeLinecap="round">
        <path d={SEAL_CAR[0]} strokeWidth="9" />
        <path d={SEAL_CAR[1]} strokeWidth="6" />
      </g>
      <g fill="#8AD6FF">
        <circle cx="26" cy="130" r="3.6" />
        <circle cx="234" cy="130" r="3.6" />
      </g>
    </svg>
  );
}
