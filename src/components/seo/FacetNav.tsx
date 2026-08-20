import Link from "next/link";
import type { Vehicle } from "@/data/vehicles";
import { bodiesOf, brandsOf } from "@/data/vehicles";

/** Maillage interne : chaque page catalogue pointe vers toutes les autres */
export function FacetNav({ vehicles, exclude }: { vehicles: Vehicle[]; exclude?: string }) {
  const brands = brandsOf(vehicles);
  const bodies = bodiesOf(vehicles);
  const chip =
    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[12.5px] transition-colors hover:border-[var(--brand)]";

  return (
    <div className="grid gap-5 mt-10">
      <div>
        <h2 className="text-[11px] font-medium tracking-[.2em] uppercase mb-3" style={{ color: "var(--brand)" }}>
          Par carrosserie
        </h2>
        <div className="flex flex-wrap gap-2">
          {bodies
            .filter((b) => b.slug !== exclude)
            .map((b) => (
              <Link key={b.slug} href={`/vehicules/categorie/${b.slug}`} className={chip}
                    style={{ borderColor: "var(--line-2)", background: "var(--surf)", color: "var(--ink-2)" }}>
                {b.label} <em className="not-italic opacity-60 tnum">{b.count}</em>
              </Link>
            ))}
        </div>
      </div>
      <div>
        <h2 className="text-[11px] font-medium tracking-[.2em] uppercase mb-3" style={{ color: "var(--brand)" }}>
          Par marque
        </h2>
        <div className="flex flex-wrap gap-2">
          {brands
            .filter((b) => b.slug !== exclude)
            .map((b) => (
              <Link key={b.slug} href={`/vehicules/marque/${b.slug}`} className={chip}
                    style={{ borderColor: "var(--line-2)", background: "var(--surf)", color: "var(--ink-2)" }}>
                {b.brand} <em className="not-italic opacity-60 tnum">{b.count}</em>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
