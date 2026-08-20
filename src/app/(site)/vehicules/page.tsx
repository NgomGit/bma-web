import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FacetNav } from "@/components/seo/FacetNav";
import { VehicleGrid } from "@/components/seo/VehicleGrid";
import { JsonLd, breadcrumbLd, dealerLd, graph, itemListLd, meta } from "@/lib/seo";
import { getVehicles } from "@/lib/store";
import { site } from "@/lib/site";

const TITLE = "Voitures d'occasion à Dakar — dès 10 millions FCFA | BMA";
const DESC =
  "Le parc BMA à Dakar : SUV, 4×4, pick-up et berlines d'occasion vérifiés, à partir de 10 000 000 FCFA. Papiers en règle, essai avant achat, import sur commande. Prix communiqué par téléphone.";

export const metadata: Metadata = meta({
  title: TITLE,
  description: DESC,
  path: "/vehicules",
  keywords: [
    "voiture occasion Dakar", "voiture d'occasion Sénégal", "acheter voiture Dakar",
    "concessionnaire Dakar", "SUV occasion Dakar", "4x4 occasion Sénégal",
    "pick-up Dakar", "voiture haut de gamme Dakar", "voiture 10 millions FCFA",
  ],
});

export default async function CataloguePage() {
  const vehicles = await getVehicles();
  const trail = [{ name: "Accueil", path: "/" }, { name: "Véhicules", path: "/vehicules" }];

  return (
    <article className="section" style={{ paddingTop: "calc(var(--nav) + 40px)" }}>
      <JsonLd data={graph(dealerLd(), breadcrumbLd(trail), itemListLd(vehicles, "/vehicules", TITLE))} />
      <div className="wrap">
        <Breadcrumbs trail={trail} />
        <span className="kicker">Catalogue · {vehicles.length} véhicules</span>
        <h1 className="h2 mt-4 mb-4">Voitures d&apos;occasion à Dakar</h1>
        <p className="lead mb-3">
          Tout le parc de {site.legalName}, mis à jour en continu. Notre gamme commence à{" "}
          <strong style={{ color: "var(--ink)", fontWeight: 500 }}>10 000 000 FCFA</strong> : nous ne
          proposons que des véhicules dont l&apos;état, l&apos;historique et le dossier administratif
          justifient ce niveau de prix.
        </p>
        <p className="lead mb-8">
          Chaque véhicule est contrôlé avant sa mise en vente, ses papiers sont complets à votre nom, et
          vous l&apos;essayez avant de décider — accompagné de votre mécanicien si vous le souhaitez. Le
          prix exact se discute de vive voix : appelez ou écrivez sur WhatsApp, réponse le jour même.
        </p>

        <VehicleGrid vehicles={vehicles} />
        <FacetNav vehicles={vehicles} />

        <div className="card p-6 mt-10 hover:!translate-y-0">
          <h2 className="text-[19px] tracking-[-.03em] mb-3">Vous ne trouvez pas votre modèle ?</h2>
          <p className="lead mb-4">
            Nous commandons depuis le Japon, Dubaï et l&apos;Europe le véhicule exact que vous cherchez,
            avec rapport d&apos;inspection avant achat et dédouanement inclus.
          </p>
          <Link href="/import-voiture-dakar" className="btn btn--primary btn--sm">
            Importer une voiture au Sénégal
          </Link>
        </div>
      </div>
    </article>
  );
}
