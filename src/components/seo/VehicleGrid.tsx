import Link from "next/link";
import Image from "next/image";
import { Silhouette } from "@/components/vehicle/VehicleVisual";
import { QuickView } from "@/components/vehicle/QuickView";
import { Arrow } from "@/components/ui/icons";
import type { Vehicle } from "@/data/vehicles";

/**
 * Grille de véhicules rendue côté serveur.
 *
 * La carte est un lien vers la fiche — Google suit des liens, pas des
 * gestionnaires d'événements. Le lien est « étiré » (absolu sur toute la
 * carte) plutôt qu'enroulé autour du contenu : un bouton ne peut pas vivre
 * dans un `<a>` sans produire du HTML invalide, et l'aperçu rapide doit
 * pouvoir se poser par-dessus.
 */
export function VehicleGrid({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-[22px]">
      {vehicles.map((v, i) => (
        <article key={v.slug} className="card group/stage relative overflow-hidden flex flex-col">
          <Link
            href={`/vehicules/${v.slug}`}
            className="absolute inset-0 z-[4]"
            aria-label={`Voir la fiche ${v.brand} ${v.model} ${v.year}`}
          />

          <div className="stage relative aspect-[16/9] grid place-items-center p-3 overflow-hidden">
            <span className="scanline" />
            <span
              className="absolute top-3 left-3 z-[3] px-2.5 py-1.5 rounded-full text-[10px] font-medium backdrop-blur-md border"
              style={
                v.status === "commande"
                  ? { background: "rgba(4,18,34,.62)", color: "#8AD6FF", borderColor: "rgba(138,214,255,.45)" }
                  : { background: "rgba(5,24,16,.62)", color: "#5BE49B", borderColor: "rgba(91,228,155,.45)" }
              }
            >
              {v.status === "commande" ? "Sur commande" : "Disponible"}
            </span>
            <span
              className="absolute top-3 right-3 z-[3] px-2.5 py-1.5 rounded-full text-[10.5px] font-medium tnum backdrop-blur-md border"
              style={{ background: "var(--blur)", borderColor: "var(--line)" }}
            >
              {v.year}
            </span>
            {v.photos?.length ? (
              <Image
                src={v.photos[0]}
                alt={`${v.brand} ${v.model} ${v.year} d'occasion à Dakar`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={i < 3}
                className="object-cover z-[2] transition-transform duration-700 group-hover/stage:scale-[1.045]"
              />
            ) : (
              <span className="relative z-[2] w-full transition-transform duration-500 group-hover/stage:translate-x-2 group-hover/stage:scale-[1.04]">
                <Silhouette body={v.body} className="w-full" />
              </span>
            )}
            <QuickView vehicle={v} />
          </div>

          <div className="p-[18px] flex flex-col gap-3.5 flex-1">
            <div>
              <span className="block text-[9.5px] font-medium tracking-[.2em] uppercase" style={{ color: "var(--brand)" }}>
                {v.brand}
              </span>
              <h3 className="text-[18.5px] mt-1.5 tracking-[-.03em]">{v.model}</h3>
            </div>

            <dl className="grid grid-cols-2 gap-2.5 m-0 text-[12px]" style={{ color: "var(--ink-2)" }}>
              <div><dt className="sr-only">Kilométrage</dt><dd className="m-0">{v.mileage}</dd></div>
              <div><dt className="sr-only">Boîte</dt><dd className="m-0">{v.gearbox}</dd></div>
              <div><dt className="sr-only">Carburant</dt><dd className="m-0">{v.fuel}</dd></div>
              <div><dt className="sr-only">Places</dt><dd className="m-0">{v.seats} places</dd></div>
            </dl>

            <div className="mt-auto flex items-center justify-between gap-2.5 pt-3.5 border-t" style={{ borderColor: "var(--line)" }}>
              <span>
                <b className="block text-[13px] font-medium">Prix sur demande</b>
                <small className="block text-[11px]" style={{ color: "var(--ink-3)" }}>
                  À partir de 10 millions FCFA
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
        </article>
      ))}
    </div>
  );
}
