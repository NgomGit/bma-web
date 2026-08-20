"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Phone, WhatsApp } from "@/components/ui/icons";
import { site, wa } from "@/lib/site";
import type { Vehicle } from "@/data/vehicles";

/**
 * Briques de recherche partagées par le catalogue et la section « Le parc ».
 *
 * Les deux écrans cherchent la même chose de la même façon ; les garder dans un
 * seul fichier évite qu'ils divergent — typiquement, qu'on corrige les accents
 * d'un côté et pas de l'autre.
 */

/** Sans accents ni casse : « Mercédès » doit trouver « Mercedes ». */
export const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Filtre par mots : tous doivent apparaître quelque part dans la fiche, pour
 * que « bmw 2019 » ne ramène pas toutes les BMW.
 */
export function useVehicleSearch(vehicles: Vehicle[], query: string) {
  const haystacks = useMemo(
    () =>
      vehicles.map((v) =>
        fold(
          [v.brand, v.model, String(v.year), v.fuel, v.gearbox, v.color, v.bodywork, v.drivetrain, v.origin]
            .join(" "),
        ),
      ),
    [vehicles],
  );

  return useMemo(() => {
    const terms = fold(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return vehicles;
    return vehicles.filter((_, i) => terms.every((t) => haystacks[i].includes(t)));
  }, [query, vehicles, haystacks]);
}

export function SearchField({
  value,
  onChange,
  className = "max-w-[560px]",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <span
        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--ink-3)" }}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" />
        </svg>
      </span>
      {/* les variantes ::-webkit-search-* masquent la croix native, qui ferait
          doublon avec la nôtre — et n'est pas stylable autrement */}
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher : marque, modèle, année, diesel…"
        aria-label="Rechercher un véhicule dans le parc"
        className="w-full rounded-full border pl-11 pr-11 py-3.5 text-[14.5px] outline-none
                   transition-colors focus:border-[var(--brand)]
                   [&::-webkit-search-cancel-button]:appearance-none
                   [&::-webkit-search-decoration]:appearance-none"
        style={{ background: "var(--surf)", borderColor: "var(--line-2)", color: "var(--ink)" }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Effacer la recherche"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full grid place-items-center"
          style={{ color: "var(--ink-3)" }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Aucun résultat — on transforme l'impasse en demande d'import.
 * La recherche saisie part telle quelle dans le message WhatsApp : le visiteur
 * n'a rien à retaper, et Baye Mor reçoit le modèle exact recherché.
 */
export function NoVehicleFound({ query }: { query: string }) {
  return (
    <div
      className="card p-6 sm:p-8 text-center hover:!translate-y-0"
      style={{ borderColor: "color-mix(in oklab, var(--brand) 32%, transparent)" }}
    >
      <span
        className="inline-grid place-items-center w-12 h-12 rounded-full mb-4"
        style={{ background: "color-mix(in oklab, var(--brand) 14%, transparent)", color: "var(--brand)" }}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6M11 8v6M8 11h6" />
        </svg>
      </span>

      <h3 className="text-[21px] tracking-[-.03em] mb-2.5">
        Aucun véhicule ne correspond à «&nbsp;{query}&nbsp;»
      </h3>
      <p className="lead mx-auto mb-6">
        Ce n&apos;est pas un problème : nous faisons venir le modèle exact que vous cherchez depuis le
        Japon, Dubaï ou l&apos;Europe. Inspection avant achat, fret, dédouanement et immatriculation
        compris — délai moyen de 45 jours.
      </p>

      <div className="flex flex-wrap gap-2.5 justify-center">
        <a
          href={wa(
            `Bonjour Baye Mor, je cherche une « ${query} ». Je ne l'ai pas trouvée sur le site — pouvez-vous me la commander depuis l'étranger ?`,
          )}
          target="_blank"
          rel="noopener"
          className="btn btn--wa"
        >
          <WhatsApp /> Commander cette voiture
        </a>
        <a href={`tel:${site.phone}`} className="btn btn--ghost">
          <Phone /> Appeler
        </a>
      </div>

      <p className="text-[13px] mt-5" style={{ color: "var(--ink-2)" }}>
        <Link href="/import-voiture-dakar" style={{ color: "var(--brand)" }}>
          Comment se déroule un import
        </Link>
      </p>
    </div>
  );
}
