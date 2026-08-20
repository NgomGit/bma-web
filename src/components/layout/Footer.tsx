import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { site, waGeneral } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative z-[2] border-t" style={{ borderColor: "var(--line)", padding: "52px 0 calc(70px + 34px)" }}>
      <div className="wrap">
        <div className="tread mb-10" />
        <div className="grid gap-7 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <span className="group/logo inline-block"><Logo /></span>
            <p className="text-[13.5px] mt-4.5 max-w-[330px]" style={{ color: "var(--ink-2)", marginTop: 18 }}>
              {site.legalName} — {site.tagline}. Véhicules vérifiés, papiers en règle, et import sur commande depuis
              l&apos;étranger.
            </p>
          </div>
          <div>
            <h5 className="text-[10.5px] tracking-[.2em] uppercase font-medium mb-4" style={{ color: "var(--brand)" }}>Navigation</h5>
            <ul className="list-none p-0 m-0 grid gap-2.5">
              {[
                { href: "/vehicules", label: "Tout le catalogue" },
                { href: "/vehicules/categorie/suv-4x4", label: "SUV et 4×4 à Dakar" },
                { href: "/vehicules/categorie/pick-up", label: "Pick-up à Dakar" },
                { href: "/vehicules/categorie/berline", label: "Berlines d'occasion" },
                { href: "/vehicules/categorie/crossover", label: "Crossovers" },
                { href: "/import-voiture-dakar", label: "Importer une voiture" },
              ].map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-[13.5px] transition-colors hover:text-[var(--ink)]" style={{ color: "var(--ink-2)" }}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-[10.5px] tracking-[.2em] uppercase font-medium mb-4" style={{ color: "var(--brand)" }}>Contact</h5>
            <ul className="list-none p-0 m-0 grid gap-2.5" style={{ color: "var(--ink-2)" }}>
              <li><a href={`tel:${site.phone}`} className="text-[13.5px]">{site.phoneDisplay}</a></li>
              <li><a href={waGeneral()} target="_blank" rel="noopener" className="text-[13.5px]">WhatsApp</a></li>
              <li><Link href="/#contact" className="text-[13.5px]">{site.address.city}, {site.address.countryName}</Link></li>
              <li><span className="text-[13.5px]">{site.hours}</span></li>
            </ul>
          </div>
        </div>

        <div
          className="mt-11 font-bold leading-[.8] select-none overflow-hidden"
          style={{ fontSize: "clamp(56px,17vw,190px)", letterSpacing: "-.06em", color: "transparent", WebkitTextStroke: "1px var(--line-2)" }}
          aria-hidden
        >
          BMA
        </div>

        <div className="mt-7 pt-5.5 border-t flex flex-wrap gap-2.5 justify-between text-[12px]" style={{ borderColor: "var(--line)", color: "var(--ink-3)", paddingTop: 22 }}>
          <span>© {new Date().getFullYear()} {site.name} — {site.legalName}, {site.address.city}</span>
          <span>Prix communiqués sur demande</span>
        </div>
      </div>
    </footer>
  );
}
