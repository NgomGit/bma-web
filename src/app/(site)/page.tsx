import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { Selection } from "@/components/sections/Selection";
import { Fleet } from "@/components/sections/Fleet";
import { ImportProcess } from "@/components/sections/ImportProcess";
import { Numbers } from "@/components/sections/Numbers";
import { Guarantees } from "@/components/sections/Guarantees";
import { Reviews } from "@/components/sections/Reviews";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { FacetNav } from "@/components/seo/FacetNav";
import { faqItems } from "@/data/faq";
import { JsonLd, dealerLd, faqLd, graph, itemListLd, meta } from "@/lib/seo";
import { getVehicles } from "@/lib/store";

export const metadata: Metadata = meta({
  title: "BMA — Concessionnaire auto à Dakar, dès 10 millions FCFA",
  description:
    "Baye Mor Automobile (BMA), concessionnaire à Dakar : SUV, 4×4, pick-up et berlines d'occasion vérifiés à partir de 10 000 000 FCFA. Papiers en règle, essai avant achat, import sur commande depuis le Japon, Dubaï et l'Europe. Prix communiqué sur demande.",
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
          faqLd(faqItems),
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
          <p className="lead mb-2">
            Notre gamme démarre à <strong style={{ color: "var(--ink)", fontWeight: 500 }}>10 000 000 FCFA</strong> —
            nous ne mettons en vente que des véhicules dont l&apos;état et le dossier justifient ce niveau de prix.
          </p>
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
      <Numbers />
      <Guarantees />
      <Reviews />
      <Faq />
      <Contact />
    </>
  );
}

