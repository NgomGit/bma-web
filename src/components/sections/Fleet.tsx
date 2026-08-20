"use client";

import { AnimatePresence, LayoutGroup } from "framer-motion";
import { useDeferredValue, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { NoVehicleFound, SearchField, useVehicleSearch } from "@/components/vehicle/searchKit";
import { Arrow } from "@/components/ui/icons";
import { countFor, filters, matches, type FilterKey, type Vehicle } from "@/data/vehicles";

/**
 * Le parc complet : recherche libre, puis filtres par carrosserie.
 *
 * La recherche est ici et pas seulement sur la page catalogue : c'est l'accueil
 * que la plupart des visiteurs voient en premier, et quelqu'un qui cherche une
 * marque précise ne devrait pas avoir à changer de page pour la taper.
 */
export function Fleet({ vehicles }: { vehicles: Vehicle[] }) {
  const [key, setKey] = useState<FilterKey>("tous");
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const found = useVehicleSearch(vehicles, deferred);
  const list = found.filter((v) => matches(v, key));
  const searching = deferred.trim().length > 0;

  return (
    <section className="section pt-0" id="parc">
      <div className="wrap">
        <Reveal className="mb-9">
          <span className="kicker">02 — Le parc</span>
          <h2 className="h2 mt-4">Tous les véhicules</h2>
          <p className="lead mt-3.5">
            Les prix ne sont pas affichés : chaque tarif dépend de l&apos;état réel du véhicule et de votre mode de
            paiement. Un appel suffit pour l&apos;obtenir, sans engagement.
          </p>
        </Reveal>

        <Reveal className="mb-5">
          <SearchField value={query} onChange={setQuery} />
        </Reveal>

        <div
          className="flex gap-2 overflow-x-auto no-bar md:flex-wrap mb-6"
          style={{ margin: "0 calc(var(--pad) * -1) 24px", padding: "2px var(--pad) 14px" }}
        >
          {/* une catégorie vide n'est pas un filtre, c'est une impasse : on la masque */}
          {filters
            .filter((f) => f.key === "tous" || countFor(found, f.key) > 0)
            .map((f) => {
            const on = key === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setKey(f.key)}
                aria-pressed={on}
                className="shrink-0 px-[18px] py-2.5 rounded-full border text-[13px] transition-all duration-300"
                style={{
                  background: on ? "var(--brand)" : "var(--surf)",
                  borderColor: on ? "var(--brand)" : "var(--line-2)",
                  color: on ? "#fff" : "var(--ink-2)",
                  fontWeight: on ? 500 : 300,
                  boxShadow: on ? "var(--glow)" : "var(--sh-s)",
                }}
              >
                {f.label}
                <em className="not-italic ml-1.5 text-[11px] opacity-60 tnum">{countFor(found, f.key)}</em>
              </button>
            );
          })}
        </div>

        <LayoutGroup>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-[22px]">
            <AnimatePresence mode="popLayout">
              {list.map((v, i) => (
                <VehicleCard key={v.slug} vehicle={v} index={i} />
              ))}
            </AnimatePresence>
          </div>
        </LayoutGroup>

        {searching && list.length === 0 && <NoVehicleFound query={query.trim()} />}

        {!searching && (
          <Reveal className="mt-9 flex flex-wrap gap-3 items-center">
            <p className="lead flex-1 min-w-[260px]">
              Le modèle que vous cherchez n&apos;est pas là ? Nous allons le chercher.
            </p>
            <a href="#import" className="btn btn--ghost">
              Demander un import <Arrow />
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}
