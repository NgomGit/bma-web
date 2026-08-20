"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { VehicleGrid } from "@/components/seo/VehicleGrid";
import { Phone, WhatsApp } from "@/components/ui/icons";
import { site, wa } from "@/lib/site";
import type { Vehicle } from "@/data/vehicles";

/**
 * Recherche dans le parc, avec repli sur la commande.
 *
 * Le filtrage est fait côté client sur la liste complète : le parc tient en
 * quelques dizaines de véhicules, une requête serveur par frappe serait du
 * gaspillage. La grille reste rendue par `VehicleGrid`, donc les fiches
 * demeurent de vrais liens indexables — Google voit le catalogue entier au
 * chargement, la recherche ne fait que masquer des cartes.
 *
 * Le cas « aucun résultat » est le plus important commercialement : c'est
 * exactement le moment où le visiteur sait ce qu'il veut et ne le trouve pas.
 * Plutôt qu'un cul-de-sac, on lui propose de le commander, avec sa recherche
 * déjà écrite dans le message WhatsApp.
 */

/** Sans accents ni casse : « Mercédès » doit trouver « Mercedes ». */
const fold = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function VehicleSearch({ vehicles }: { vehicles: Vehicle[] }) {
  const [query, setQuery] = useState("");
  // la frappe reste fluide même si la grille est longue à re-rendre
  const deferred = useDeferredValue(query);

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

  const results = useMemo(() => {
    const terms = fold(deferred).split(/\s+/).filter(Boolean);
    if (!terms.length) return vehicles;
    // tous les mots doivent apparaître : « bmw 2019 » ne doit pas ramener toutes les BMW
    return vehicles.filter((_, i) => terms.every((t) => haystacks[i].includes(t)));
  }, [deferred, vehicles, haystacks]);

  const searching = deferred.trim().length > 0;
  const empty = searching && results.length === 0;

  return (
    <div>
      <div className="relative max-w-[560px]">
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--ink-3)" }}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" />
          </svg>
        </span>
        {/* les deux variantes ::-webkit-search-* masquent la croix native, qui
            ferait doublon avec la nôtre — et n'est pas stylable autrement */}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher : marque, modèle, année, diesel…"
          aria-label="Rechercher un véhicule dans le parc"
          className="w-full rounded-full border pl-11 pr-11 py-3.5 text-[14.5px] outline-none
                     transition-colors focus:border-[var(--brand)]
                     [&::-webkit-search-cancel-button]:appearance-none
                     [&::-webkit-search-decoration]:appearance-none"
          style={{ background: "var(--surf)", borderColor: "var(--line-2)", color: "var(--ink)" }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Effacer la recherche"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full grid place-items-center transition-colors"
            style={{ color: "var(--ink-3)" }}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      <p className="text-[13px] mt-3 mb-7" style={{ color: "var(--ink-3)" }} role="status" aria-live="polite">
        {searching
          ? `${results.length} véhicule${results.length > 1 ? "s" : ""} sur ${vehicles.length}`
          : `${vehicles.length} véhicules au showroom`}
      </p>

      {results.length > 0 && <VehicleGrid vehicles={results} />}

      {empty && <NotFound query={query.trim()} />}
    </div>
  );
}

/**
 * Aucun résultat — on transforme l'impasse en demande d'import.
 * La recherche saisie part telle quelle dans le message WhatsApp : le visiteur
 * n'a rien à retaper, et Baye Mor reçoit le modèle exact recherché.
 */
function NotFound({ query }: { query: string }) {
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

      <h2 className="text-[21px] tracking-[-.03em] mb-2.5">
        Aucun véhicule ne correspond à «&nbsp;{query}&nbsp;»
      </h2>
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
