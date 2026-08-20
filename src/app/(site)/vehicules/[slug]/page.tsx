import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Silhouette } from "@/components/vehicle/VehicleVisual";
import { Gallery } from "@/components/vehicle/Gallery";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { VehicleGrid } from "@/components/seo/VehicleGrid";
import { ArrowLeft, Check, Phone, WhatsApp } from "@/components/ui/icons";
import { JsonLd, breadcrumbLd, dealerLd, graph, meta, vehicleLd } from "@/lib/seo";
import { getVehicle, getVehicles } from "@/lib/store";
import { BODY_PLURAL, BODY_SLUGS, slugify } from "@/data/vehicles";
import { site, waVehicle } from "@/lib/site";

export async function generateStaticParams() {
  return (await getVehicles()).map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = await getVehicle(slug);
  if (!v) return {};

  return meta({
    title: `${v.brand} ${v.model} ${v.year} — ${v.mileage} | Dakar`,
    description: `${v.brand} ${v.model} ${v.year} d'occasion à Dakar : ${v.mileage}, boîte ${v.gearbox.toLowerCase()}, ${v.fuel.toLowerCase()}, ${v.engine} ${v.power}, ${v.seats} places. ${v.origin}, papiers en règle, essai avant achat. Prix sur demande — à partir de 10 millions FCFA.`,
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

  const specs: [string, string][] = [
    ["Année", String(v.year)],
    ["Kilométrage", v.mileage],
    ["Boîte", v.gearbox],
    ["Carburant", v.fuel],
    ["Motorisation", `${v.engine} · ${v.power}`],
    ["Places", String(v.seats)],
    ["Couleur", v.color],
    ["Transmission", v.drivetrain],
    ["Carrosserie", v.bodywork],
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
            <span className="kicker">
              {v.status === "commande" ? `Sur commande · ${v.lead}` : "Disponible au showroom de Dakar"}
            </span>
            <h1 className="h2 mt-4">
              {v.brand} {v.model}
            </h1>
            <p className="lead mt-3">
              {v.year} · {v.mileage} · {v.origin}
            </p>

            <h2 className="text-[12px] tracking-[.16em] uppercase font-medium mt-8 mb-3.5" style={{ color: "var(--brand)" }}>
              Fiche technique
            </h2>
            <dl
              className="grid grid-cols-2 sm:grid-cols-3 gap-px rounded-[var(--r2)] overflow-hidden border m-0"
              style={{ background: "var(--line)", borderColor: "var(--line)" }}
            >
              {specs.map(([k, val]) => (
                <div key={k} className="p-3.5" style={{ background: "var(--surf)" }}>
                  <dt className="block text-[9.5px] tracking-[.15em] uppercase" style={{ color: "var(--ink-3)" }}>{k}</dt>
                  <dd className="block mt-1.5 text-[14px] font-medium m-0">{val}</dd>
                </div>
              ))}
            </dl>

            <h2 className="text-[12px] tracking-[.16em] uppercase font-medium mt-8 mb-3.5" style={{ color: "var(--brand)" }}>
              Équipements
            </h2>
            <ul className="grid sm:grid-cols-2 gap-2.5 list-none p-0 m-0">
              {v.equipment.map((e) => (
                <li key={e} className="flex gap-2.5 text-[13.5px]" style={{ color: "var(--ink-2)" }}>
                  <span className="shrink-0 mt-[3px]" style={{ color: "#2FBB74" }}>
                    <Check className="w-[15px] h-[15px]" />
                  </span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>

            <h2 className="text-[12px] tracking-[.16em] uppercase font-medium mt-8 mb-3" style={{ color: "var(--brand)" }}>
              Le mot de BMA
            </h2>
            <p className="lead">{v.note}</p>

            <div
              className="p-4 px-[18px] rounded-[var(--r2)] border text-[13px] mt-7"
              style={{ background: "var(--surf-2)", borderColor: "var(--line-2)", color: "var(--ink-2)" }}
            >
              <b style={{ color: "var(--ink)", fontWeight: 500 }}>Prix communiqué sur demande.</b> Notre parc
              démarre à 10 000 000 FCFA ; le tarif exact de ce véhicule dépend de son état réel et de votre
              mode de paiement. Appelez ou écrivez sur WhatsApp — réponse le jour même.
            </div>

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
