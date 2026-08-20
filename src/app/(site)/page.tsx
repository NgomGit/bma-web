import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { Selection } from "@/components/sections/Selection";
import { Fleet } from "@/components/sections/Fleet";
import { ImportProcess } from "@/components/sections/ImportProcess";
import { Contact } from "@/components/sections/Contact";
import { FacetNav } from "@/components/seo/FacetNav";
import { JsonLd, dealerLd, graph, itemListLd, meta } from "@/lib/seo";
import { getVehicles } from "@/lib/store";

export const metadata: Metadata = meta({
  title: "BMA — Concessionnaire automobile à Dakar",
  description:
    "Baye Mor Automobile (BMA), concessionnaire à Dakar : SUV, 4×4, pick-up et berlines d'occasion vérifiés. Papiers en règle, essai avant achat, import sur commande depuis le Japon, Dubaï et l'Europe. Prix communiqué sur demande.",
  path: "/",
  keywords: [
    "concessionnaire Dakar",
    "voiture occasion Dakar",
    "voiture d'occasion Sénégal",
    "acheter voiture Dakar",
    "SUV occasion Dakar",
    "4x4 occasion Sénégal",
    "pick-up Dakar",
    "importer voiture Sénégal",
    "voiture haut de gamme Dakar",
    "Baye Mor Automobile",
  ],
});

export default async function Home() {
  const vehicles = await getVehicles();
  const featured = vehicles.filter((v) => v.featured);
  const shown = featured.length ? featured : vehicles.slice(0, 3);

  return (
    <>
      <JsonLd
        data={graph(
          dealerLd(),
          itemListLd(vehicles, "/", "Véhicules disponibles chez BMA à Dakar"),
        )}
      />
      <Hero vehicles={shown} />
      <Selection vehicles={shown} />
      <Fleet vehicles={vehicles} />

      {/* Maillage interne : donne à Google des chemins clairs vers les pages catalogue */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="text-[13px] tracking-[.16em] uppercase font-medium mb-2" style={{ color: "var(--brand)" }}>
            Parcourir le parc
          </h2>
          <FacetNav vehicles={vehicles} />
          <p className="mt-6 text-[13.5px]" style={{ color: "var(--ink-2)" }}>
            <Link href="/vehicules" style={{ color: "var(--brand)" }}>
              Voir tout le catalogue
            </Link>{" "}
            ·{" "}
            <Link href="/import-voiture-dakar" style={{ color: "var(--brand)" }}>
              Importer une voiture au Sénégal
            </Link>
          </p>
        </div>
      </section>

      <ImportProcess />
      <Contact />
    </>
  );
}

