"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Arrow, Fuel, Gauge, Gearbox, Seat } from "@/components/ui/icons";
import { VehicleVisual } from "./VehicleVisual";
import { QuickView } from "./QuickView";
import type { Vehicle } from "@/data/vehicles";

const Spec = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <span className="flex items-center gap-2 text-[12px]" style={{ color: "var(--ink-2)" }}>
    <span className="w-3.5 h-3.5 shrink-0 opacity-90" style={{ color: "var(--brand)" }}>
      {icon}
    </span>
    {children}
  </span>
);

/**
 * Carte du parc, page d'accueil.
 *
 * La carte mène à la fiche complète ; l'aperçu rapide est un bouton distinct
 * posé sur la photo. C'est l'inverse du comportement d'origine, où toute la
 * carte ouvrait le panneau : un visiteur qui clique sur une voiture veut sa
 * page, et un panneau modal n'a pas d'adresse à partager.
 */
export function VehicleCard({ vehicle, index = 0 }: { vehicle: Vehicle; index?: number }) {
  const onOrder = vehicle.status === "commande";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.035, ease: [0.19, 0.72, 0.3, 1] }}
      className="card group/stage relative w-full text-left flex flex-col overflow-hidden"
    >
      <Link
        href={`/vehicules/${vehicle.slug}`}
        className="absolute inset-0 z-[4]"
        aria-label={`Voir la fiche ${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
      />

      <div className="stage relative aspect-[16/9] grid place-items-center p-3 overflow-hidden">
        <span className="scanline" />
        <span
          className="absolute top-3 left-3 z-[3] px-2.5 py-1.5 rounded-full text-[10px] font-medium backdrop-blur-md border"
          style={
            onOrder
              ? { background: "rgba(4,18,34,.62)", color: "#8AD6FF", borderColor: "rgba(138,214,255,.45)" }
              : { background: "rgba(5,24,16,.62)", color: "#5BE49B", borderColor: "rgba(91,228,155,.45)" }
          }
        >
          {onOrder ? "Sur commande" : "Disponible"}
        </span>
        <span
          className="absolute top-3 right-3 z-[3] px-2.5 py-1.5 rounded-full text-[10.5px] font-medium tnum backdrop-blur-md border"
          style={{ background: "var(--blur)", borderColor: "var(--line)" }}
        >
          {vehicle.year}
        </span>
        <span
          className={
            vehicle.photos?.length
              ? "absolute inset-0 z-[2] transition-transform duration-700 group-hover/stage:scale-[1.045]"
              : "relative w-full z-[2] transition-transform duration-500 group-hover/stage:translate-x-2 group-hover/stage:scale-[1.04]"
          }
        >
          <VehicleVisual vehicle={vehicle} />
        </span>
        <QuickView vehicle={vehicle} />
      </div>

      <div className="p-[18px] flex flex-col gap-3.5 flex-1">
        <div>
          <span className="block text-[9.5px] font-medium tracking-[.2em] uppercase" style={{ color: "var(--brand)" }}>
            {vehicle.brand}
          </span>
          <h3 className="text-[18.5px] mt-1.5 tracking-[-.03em]">{vehicle.model}</h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Spec icon={<Gauge className="w-full h-full" />}>{vehicle.mileage}</Spec>
          <Spec icon={<Gearbox className="w-full h-full" />}>{vehicle.gearbox}</Spec>
          <Spec icon={<Fuel className="w-full h-full" />}>{vehicle.fuel}</Spec>
          <Spec icon={<Seat className="w-full h-full" />}>{vehicle.seats} places</Spec>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2.5 pt-3.5 border-t" style={{ borderColor: "var(--line)" }}>
          <span>
            <b className="block text-[13px] font-medium">Prix sur demande</b>
            <small className="block text-[11px]" style={{ color: "var(--ink-3)" }}>
              Communiqué par téléphone
            </small>
          </span>
          <span
            className="w-10 h-10 rounded-full border grid place-items-center shrink-0 transition-all duration-400
                       group-hover/stage:bg-[var(--brand)] group-hover/stage:border-[var(--brand)]
                       group-hover/stage:text-white group-hover/stage:-rotate-45"
            style={{ borderColor: "var(--line-2)" }}
          >
            <Arrow className="w-4 h-4" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}
