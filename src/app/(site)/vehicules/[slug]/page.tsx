import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Silhouette } from "@/components/vehicle/VehicleVisual";
import { Gallery } from "@/components/vehicle/Gallery";
import { SpecGrid } from "@/components/vehicle/SpecGrid";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { VehicleGrid } from "@/components/seo/VehicleGrid";
import { ArrowLeft, Phone, WhatsApp } from "@/components/ui/icons";
import { JsonLd, breadcrumbLd, dealerLd, graph, meta, vehicleLd } from "@/lib/seo";
import { getVehicle, getVehicles } from "@/lib/store";
import { BODY_PLURAL, BODY_SLUGS, formatPrice, slugify } from "@/data/vehicles";
import { site, waVehicle } from "@/lib/site";

export async function generateStaticParams() {
  return (await getVehicles()).map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = await getVehicle(slug);
  if (!v) return {};

  // Motorisation et puissance sont facultatives : sans elles, la phrase se
  // referme proprement au lieu de garder un blanc ou une virgule en trop.
  const moteur = [v.engine, v.power].map((s) => s?.trim()).filter(Boolean).join(" ");
  // Le prix est annoncé quand il est connu : écrire « prix communiqué par
  // téléphone » alors que la page affiche 18 500 000 FCFA fait perdre le clic.
  const prix = v.price ? `Prix : ${formatPrice(v.price)}.` : "Prix communiqué par téléphone.";

  return meta({
    title: `${v.brand} ${v.model} ${v.year} — ${v.mileage} | Dakar`,
    description:
      `${v.brand} ${v.model} ${v.year} d'occasion à Dakar : ${v.mileage}, ` +
      `boîte ${v.gearbox.toLowerCase()}, ${v.fuel.toLowerCase()}` +
      `${moteur ? `, ${moteur}` : ""}, ${v.seats} places. ` +
      `${v.origin}, papiers en règle, essai avant achat. ${prix}`,
    path: `/vehicules/${v.slug}`,
    keywords: [
      `${v.brand} ${v.model} Dakar`,
      `${v.brand} ${v.model} ${v.year}`,
      `prix ${v.brand} ${v.model} Sénégal`,
      `${v.brand} occasion Dakar`,
      `${v.bodywork} occasion Dakar`,
      "voiture occasion Sénégal",
      "concessionnaire Dakar",
    ],
    images: v.photos?.length ? v.photos : undefined,
  });
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [v, all] = await Promise.all([getVehicle(slug), getVehicles()]);
  if (!v) notFound();

  const brandSlug = slugify(v.brand);
  const bodySlug = BODY_SLUGS[v.body];
  const similar = all
    .filter((x) => x.slug !== v.slug && (x.body === v.body || x.brand === v.brand))
    .slice(0, 3);

  const trail = [
    { name: "Accueil", path: "/" },
    { name: "Véhicules", path: "/vehicules" },
    { name: v.brand, path: `/vehicules/marque/${brandSlug}` },
    { name: v.model, path: `/vehicules/${v.slug}` },
  ];

  return (
    <article className="section" style={{ paddingTop: "calc(var(--nav) + 40px)" }}>
      <JsonLd data={graph(dealerLd(), breadcrumbLd(trail), vehicleLd(v))} />

      <div className="wrap">
        <Breadcrumbs trail={trail} />

        {/* la photo pèse plus lourd que la fiche dans la décision : elle prend plus de place */}
        <div className="grid gap-8 lg:grid-cols-[1.22fr_.78fr] lg:gap-12 lg:items-start">
          {v.photos?.length ? (
            <Gallery
              photos={v.photos}
              alt={`${v.brand} ${v.model} ${v.year} — ${v.color}, ${v.mileage}, disponible à Dakar chez BMA`}
            />
          ) : (
            <div
              className="stage rounded-[var(--r4)] border grid place-items-center p-8 overflow-hidden relative"
              style={{ borderColor: "var(--line)", boxShadow: "var(--sh-m)" }}
            >
              <Silhouette body={v.body} className="w-full max-w-[560px] relative z-[2]" />
            </div>
          )}

          <div>
            <span className="kicker">Disponible au showroom de Dakar</span>
            <h1 className="h2 mt-4">
              {v.brand} {v.model}
            </h1>
            {/* Deux repères, pas trois. « Importé d'Europe » juste sous
                « Disponible au showroom de Dakar » brouillait le message : le
                visiteur veut d'abord savoir l'âge et l'usure. La provenance
                reste renseignée dans le back-office et sert la description de
                la page pour les recherches du type « 4×4 importé Dakar ». */}
            <p className="lead mt-3">
              {v.year} · {v.mileage}
            </p>

            {/* le prix est la première chose que l'on cherche : il passe avant la fiche technique */}
            <div
              className="mt-6 rounded-[var(--r2)] border p-4 px-5"
              style={{ background: "var(--surf-2)", borderColor: "var(--line-2)" }}
            >
              <span className="block text-[9.5px] tracking-[.16em] uppercase" style={{ color: "var(--ink-3)" }}>
                Prix
              </span>
              {v.price ? (
                <b className="block mt-1.5 text-[26px] font-bold tracking-[-.03em] tnum" style={{ color: "var(--brand)" }}>
                  {formatPrice(v.price)}
                </b>
              ) : (
                <b className="block mt-1.5 text-[19px] font-medium">Prix communiqué par téléphone</b>
              )}
              <p className="text-[12.5px] mt-1" style={{ color: "var(--ink-2)" }}>
                Appelez ou écrivez sur WhatsApp — réponse le jour même.
              </p>
            </div>

            <h2 className="text-[12px] tracking-[.16em] uppercase font-medium mt-8 mb-3.5" style={{ color: "var(--brand)" }}>
              Fiche technique
            </h2>
            <SpecGrid vehicle={v} />

            <div className="grid grid-cols-2 gap-2.5 mt-6">
              <a href={`tel:${site.phone}`} className="btn btn--primary"><Phone /> Appeler</a>
              <a href={waVehicle(v.brand, v.model, v.year)} target="_blank" rel="noopener" className="btn btn--wa">
                <WhatsApp /> WhatsApp
              </a>
            </div>

            <p className="text-[13px] mt-6" style={{ color: "var(--ink-2)" }}>
              Voir aussi :{" "}
              <Link href={`/vehicules/marque/${brandSlug}`} style={{ color: "var(--brand)" }}>
                toutes les {v.brand} à Dakar
              </Link>{" "}
              ·{" "}
              <Link href={`/vehicules/categorie/${bodySlug}`} style={{ color: "var(--brand)" }}>
                {BODY_PLURAL[v.body]} d&apos;occasion
              </Link>
            </p>
          </div>
        </div>

        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="text-[24px] tracking-[-.035em] mb-6">Véhicules similaires à Dakar</h2>
            <VehicleGrid vehicles={similar} />
          </section>
        )}

        <Link href="/vehicules" className="inline-flex items-center gap-2 text-[13px] mt-10" style={{ color: "var(--brand)" }}>
          <ArrowLeft className="w-4 h-4" /> Retour au catalogue
        </Link>
      </div>
    </article>
  );
}
