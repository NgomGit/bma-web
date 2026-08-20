"use client";

import Image from "next/image";
import { SILHOUETTES } from "@/components/brand/paths";
import type { BodyType, Vehicle } from "@/data/vehicles";

/**
 * Silhouette de carrosserie — tracé vectoriel, teinte pilotée par variables CSS.
 * Le pick-up est retourné pour que tous les véhicules regardent dans le même sens.
 */
export function Silhouette({
  body,
  tint,
  className = "",
  animate = false,
}: {
  body: BodyType;
  /** teinte unique ; sinon dégradé de marque */
  tint?: string;
  className?: string;
  /** trace le véhicule au montage, comme un plan qui se dessine */
  animate?: boolean;
}) {
  const p = SILHOUETTES[body];
  const flip = body === "pickup";
  const id = `veh-${body}${tint ? `-${tint.replace("#", "")}` : ""}`;

  return (
    <svg viewBox="0 0 240 100" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={tint ?? "var(--veh-1)"} />
          <stop offset=".55" stopColor={tint ?? "var(--veh-2)"} />
          <stop offset="1" stopColor={tint ?? "var(--veh-3)"} />
        </linearGradient>
      </defs>
      <g
        fill="none"
        stroke={`url(#${id})`}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={flip ? "translate(240,0) scale(-1,1)" : undefined}
        className={animate ? "veh-draw" : undefined}
      >
        <path d={p.body} strokeWidth="7" />
        <path d={p.ground} strokeWidth="5" />
        <path d={p.belt} strokeWidth="3" opacity=".45" />
      </g>
    </svg>
  );
}

/**
 * Visuel de véhicule : photo si elle existe, silhouette sinon.
 * ⚠️ Pour passer aux photos : renseigner `photos` dans src/data/vehicles.ts.
 */
export function VehicleVisual({
  vehicle,
  tint,
  className = "",
  priority = false,
}: {
  vehicle: Vehicle;
  tint?: string;
  className?: string;
  priority?: boolean;
}) {
  const photo = vehicle.photos?.[0];
  if (photo) {
    return (
      <Image
        src={photo}
        alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
        width={1600}
        height={900}
        priority={priority}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }
  return <Silhouette body={vehicle.body} tint={tint} className={`w-full ${className}`} />;
}
