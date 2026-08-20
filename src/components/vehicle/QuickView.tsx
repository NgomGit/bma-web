"use client";

import { useVehicleSheet } from "./SheetProvider";
import type { Vehicle } from "@/data/vehicles";

/**
 * Bouton « Aperçu rapide » posé sur une carte véhicule.
 *
 * La carte entière est un lien vers la fiche : c'est ce que Google suit et ce
 * qu'un visiteur attend d'une vignette. Ce bouton passe donc **au-dessus** du
 * lien étiré (z-index supérieur) et arrête la propagation — sinon le clic
 * remonterait et déclencherait la navigation en plus du panneau.
 *
 * Il reste visible en permanence sur écran tactile, où aucun survol ne peut le
 * révéler ; sur grand écran il apparaît au survol de la carte.
 */
export function QuickView({ vehicle }: { vehicle: Vehicle }) {
  const { open } = useVehicleSheet();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        open(vehicle);
      }}
      aria-label={`Aperçu rapide de ${vehicle.brand} ${vehicle.model}`}
      className="absolute left-3 bottom-3 z-[6] flex items-center gap-1.5 h-9 px-3.5 rounded-full
                 text-[11.5px] font-medium border backdrop-blur-md
                 transition-[opacity,transform] duration-400
                 lg:opacity-0 lg:translate-y-1.5
                 lg:group-hover/stage:opacity-100 lg:group-hover/stage:translate-y-0
                 focus-visible:opacity-100 focus-visible:translate-y-0"
      style={{ background: "var(--blur)", borderColor: "var(--line-2)", color: "var(--ink)" }}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M1.8 12S5.5 5 12 5s10.2 7 10.2 7-3.7 7-10.2 7S1.8 12 1.8 12Z" />
        <circle cx="12" cy="12" r="2.7" />
      </svg>
      Aperçu rapide
    </button>
  );
}
