"use client";

import { useDeferredValue, useState } from "react";
import { VehicleGrid } from "@/components/seo/VehicleGrid";
import { NoVehicleFound, SearchField, useVehicleSearch } from "./searchKit";
import type { Vehicle } from "@/data/vehicles";

/**
 * Recherche du catalogue.
 *
 * Le filtrage se fait dans le navigateur : le parc tient en quelques dizaines
 * de véhicules, une requête serveur par frappe serait du gaspillage. La grille
 * reste rendue par `VehicleGrid`, donc les fiches demeurent de vrais liens
 * indexables — Google voit le catalogue entier au chargement, la recherche ne
 * fait que masquer des cartes.
 */
export function VehicleSearch({ vehicles }: { vehicles: Vehicle[] }) {
  const [query, setQuery] = useState("");
  // la frappe reste fluide même si la grille est longue à re-rendre
  const deferred = useDeferredValue(query);
  const results = useVehicleSearch(vehicles, deferred);

  const searching = deferred.trim().length > 0;

  return (
    <div>
      <SearchField value={query} onChange={setQuery} />

      <p className="text-[13px] mt-3 mb-7" style={{ color: "var(--ink-3)" }} role="status" aria-live="polite">
        {searching
          ? `${results.length} véhicule${results.length > 1 ? "s" : ""} sur ${vehicles.length}`
          : `${vehicles.length} véhicule${vehicles.length > 1 ? "s" : ""} au showroom`}
      </p>

      {results.length > 0 && <VehicleGrid vehicles={results} />}
      {searching && results.length === 0 && <NoVehicleFound query={query.trim()} />}
    </div>
  );
}
