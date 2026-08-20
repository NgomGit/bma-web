"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Cadran — un chiffre clé présenté comme un compteur de tableau de bord.
 * L'aiguille et le nombre montent ensemble quand le bloc entre à l'écran.
 */
export function Dial({
  value,
  suffix = "",
  label,
  max,
}: {
  value: number;
  suffix?: string;
  label: string;
  /** valeur de fin d'échelle du cadran (défaut : la valeur elle-même) */
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [n, setN] = useState(0);
  const [t, setT] = useState(0);
  const ceiling = max ?? value;

  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(value);
      setT(1);
      return;
    }
    const a = animate(0, value, {
      duration: 1.7,
      ease: [0.19, 0.72, 0.3, 1],
      onUpdate: (v) => {
        setN(Math.round(v));
        setT(v / ceiling);
      },
    });
    return () => a.stop();
  }, [inView, value, ceiling]);

  // arc de 232° partant de 154° (repère bas-gauche), comme un compteur
  const R = 46;
  const SPAN = 232;
  const START = 154;
  const circumference = 2 * Math.PI * R;
  const arcLength = (SPAN / 360) * circumference;

  return (
    <div ref={ref} className="p-7 px-5 text-center" style={{ background: "var(--surf)" }}>
      <div className="relative mx-auto w-[108px] h-[108px]">
        <svg viewBox="0 0 108 108" className="w-full h-full -rotate-90">
          <circle
            cx="54" cy="54" r={R} fill="none" strokeWidth="5" strokeLinecap="round"
            stroke="var(--line-2)"
            strokeDasharray={`${arcLength} ${circumference}`}
            transform={`rotate(${START} 54 54)`}
          />
          <circle
            cx="54" cy="54" r={R} fill="none" strokeWidth="5" strokeLinecap="round"
            stroke="var(--brand)"
            strokeDasharray={`${arcLength * Math.min(t, 1)} ${circumference}`}
            transform={`rotate(${START} 54 54)`}
            style={{ filter: "drop-shadow(0 0 8px color-mix(in oklab, var(--brand) 55%, transparent))" }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center">
          <b className="tnum text-[26px] font-bold tracking-[-.04em]" style={{ color: "var(--brand)" }}>
            {n}
            {suffix}
          </b>
        </span>
      </div>
      <span className="block mt-3 text-[12px]" style={{ color: "var(--ink-2)" }}>
        {label}
      </span>
    </div>
  );
}
