import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FacetNav } from "@/components/seo/FacetNav";
import { VehicleGrid } from "@/components/seo/VehicleGrid";
import { JsonLd, breadcrumbLd, dealerLd, graph, itemListLd, meta } from "@/lib/seo";
import { getVehicles } from "@/lib/store";
import { BODY_FROM_SLUG, BODY_PLURAL, bodiesOf } from "@/data/vehicles";

/** Argumentaire propre à chaque carrosserie — évite les pages « vides » que Google ignore */
const PITCH: Record<string, string> = {
  suv: "Le SUV et le 4×4 restent le premier choix à Dakar : garde au sol suffisante pour les routes de région, habitabilité pour la famille, et une revente qui tient dans le temps. Nous sélectionnons en priorité les châssis sains et les transmissions vérifiées.",
  pickup: "Le pick-up double cabine est le véhicule de travail par excellence entre Dakar et l'intérieur du pays : robuste, réparable partout, et capable d'encaisser les pistes. Nous vérifions systématiquement la benne, le châssis et l'état des trains roulants.",
  berline: "La berline reste le choix de la représentation et des longs trajets sur la VDN et l'autoroute à péage : silence de roulement, consommation contenue, confort supérieur. Nous privilégions les modèles à l'entretien documenté.",
  crossover: "Le crossover réunit la position de conduite haute du SUV et la consommation d'une berline — le compromis le plus rationnel pour un usage majoritairement urbain, embouteillages dakarois compris. Les versions hybrides y sont particulièrement pertinentes.",
};

export async function generateStaticParams() {
  return bodiesOf(await getVehicles()).map((b) => ({ categorie: b.slug }));
}

async function load(categorie: string) {
  const body = BODY_FROM_SLUG[categorie];
  if (!body) return null;
  const all = await getVehicles();
  const vehicles = all.filter((v) => v.body === body);
  // une catégorie sans voiture n'est pas une page : c'est une impasse pour le
  // visiteur et du contenu vide pour Google. `bodiesOf` ne la génère déjà plus,
  // mais l'URL reste atteignable — on renvoie donc un 404 franc.
  if (!vehicles.length) return null;
  return { all, body, label: BODY_PLURAL[body], vehicles };
}

export async function generateMetadata({ params }: { params: Promise<{ categorie: string }> }): Promise<Metadata> {
  const { categorie } = await params;
  const data = await load(categorie);
  if (!data) return {};
  const { label, vehicles } = data;
  return meta({
    title: `${label.charAt(0).toUpperCase() + label.slice(1)} d'occasion à Dakar | BMA`,
    description: `${vehicles.length} ${label} d'occasion vérifiés à Dakar chez BMA : papiers en règle, essai avant achat, import sur commande. Prix communiqué par téléphone.`,
    path: `/vehicules/categorie/${categorie}`,
    keywords: [
      `${label} occasion Dakar`, `${label} Sénégal`, `acheter ${label} Dakar`,
      "voiture occasion Dakar", "concessionnaire Dakar", "voiture haut de gamme Sénégal",
      ...vehicles.slice(0, 6).map((v) => `${v.brand} ${v.model} Dakar`),
    ],
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ categorie: string }> }) {
  const { categorie } = await params;
  const data = await load(categorie);
  if (!data) notFound();
  const { all, body, label, vehicles } = data;

  const nice = label.charAt(0).toUpperCase() + label.slice(1);
  const trail = [
    { name: "Accueil", path: "/" },
    { name: "Véhicules", path: "/vehicules" },
    { name: nice, path: `/vehicules/categorie/${categorie}` },
  ];
  const title = `${nice} d'occasion à Dakar`;

  return (
    <article className="section" style={{ paddingTop: "calc(var(--nav) + 40px)" }}>
      <JsonLd data={graph(dealerLd(), breadcrumbLd(trail), itemListLd(vehicles, `/vehicules/categorie/${categorie}`, title))} />
      <div className="wrap">
        <Breadcrumbs trail={trail} />
        <span className="kicker">{nice} · {vehicles.length} véhicule{vehicles.length > 1 ? "s" : ""}</span>
        <h1 className="h2 mt-4 mb-4">{title}</h1>
        <p className="lead mb-3">{PITCH[body]}</p>
        <p className="lead mb-8">
          Tous nos {label} sont contrôlés avant mise en vente et livrés avec carte grise, quitus fiscal et
          dédouanement à votre nom. Le prix exact dépend de l&apos;état réel du véhicule et se communique
          par téléphone.
        </p>

        <VehicleGrid vehicles={vehicles} />
        <FacetNav vehicles={all} exclude={categorie} />
      </div>
    </article>
  );
}
