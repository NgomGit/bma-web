import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FacetNav } from "@/components/seo/FacetNav";
import { VehicleGrid } from "@/components/seo/VehicleGrid";
import { JsonLd, breadcrumbLd, dealerLd, graph, itemListLd, meta } from "@/lib/seo";
import { getVehicles } from "@/lib/store";
import { brandsOf, slugify } from "@/data/vehicles";

export async function generateStaticParams() {
  return brandsOf(await getVehicles()).map((b) => ({ marque: b.slug }));
}

async function load(marque: string) {
  const all = await getVehicles();
  const brand = brandsOf(all).find((b) => b.slug === marque);
  if (!brand) return null;
  return { all, brand, vehicles: all.filter((v) => slugify(v.brand) === marque) };
}

export async function generateMetadata({ params }: { params: Promise<{ marque: string }> }): Promise<Metadata> {
  const { marque } = await params;
  const data = await load(marque);
  if (!data) return {};
  const { brand, vehicles } = data;
  const models = vehicles.map((v) => v.model).slice(0, 4).join(", ");
  return meta({
    title: `${brand.brand} d'occasion à Dakar — ${vehicles.length} véhicule${vehicles.length > 1 ? "s" : ""} | BMA`,
    description: `${brand.brand} d'occasion vérifiées à Dakar : ${models}. Papiers en règle, essai avant achat, import sur commande. Prix sur demande chez BMA.`,
    path: `/vehicules/marque/${brand.slug}`,
    keywords: [
      `${brand.brand} Dakar`, `${brand.brand} occasion Sénégal`, `acheter ${brand.brand} Dakar`,
      `prix ${brand.brand} Sénégal`, `${brand.brand} d'occasion`, "concessionnaire Dakar",
      ...vehicles.slice(0, 6).map((v) => `${v.brand} ${v.model} Dakar`),
    ],
  });
}

export default async function BrandPage({ params }: { params: Promise<{ marque: string }> }) {
  const { marque } = await params;
  const data = await load(marque);
  if (!data) notFound();
  const { all, brand, vehicles } = data;

  const trail = [
    { name: "Accueil", path: "/" },
    { name: "Véhicules", path: "/vehicules" },
    { name: brand.brand, path: `/vehicules/marque/${brand.slug}` },
  ];
  const title = `${brand.brand} d'occasion à Dakar`;

  return (
    <article className="section" style={{ paddingTop: "calc(var(--nav) + 40px)" }}>
      <JsonLd data={graph(dealerLd(), breadcrumbLd(trail), itemListLd(vehicles, `/vehicules/marque/${brand.slug}`, title))} />
      <div className="wrap">
        <Breadcrumbs trail={trail} />
        <span className="kicker">{brand.brand} · {vehicles.length} véhicule{vehicles.length > 1 ? "s" : ""}</span>
        <h1 className="h2 mt-4 mb-4">{title}</h1>
        <p className="lead mb-3">
          Les {brand.brand} disponibles chez BMA, toutes vérifiées avant mise en vente et vendues avec un
          dossier administratif complet.
        </p>
        <p className="lead mb-8">
          Nous privilégions les {brand.brand} au carnet d&apos;entretien suivi et au kilométrage
          vérifiable — sur ce segment, l&apos;historique compte davantage que l&apos;année. Si le modèle
          que vous cherchez n&apos;est pas dans cette liste, nous pouvons le commander depuis
          l&apos;étranger sous 40 à 50 jours.
        </p>

        <VehicleGrid vehicles={vehicles} />
        <FacetNav vehicles={all} exclude={brand.slug} />
      </div>
    </article>
  );
}
