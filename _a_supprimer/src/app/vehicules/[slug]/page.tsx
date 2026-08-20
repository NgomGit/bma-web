import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Silhouette } from "@/components/vehicle/VehicleVisual";
import { ArrowLeft, Check, Phone, WhatsApp } from "@/components/ui/icons";
import { bySlug, vehicles } from "@/data/vehicles";
import { site, waVehicle } from "@/lib/site";

export function generateStaticParams() {
  return vehicles.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = bySlug(slug);
  if (!v) return {};
  return {
    title: `${v.brand} ${v.model} ${v.year}`,
    description: `${v.brand} ${v.model} ${v.year}, ${v.mileage}, ${v.gearbox}, ${v.fuel}. ${v.origin}. Prix communiqué sur demande — BMA, Dakar.`,
    alternates: { canonical: `/vehicules/${v.slug}` },
  };
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = bySlug(slug);
  if (!v) notFound();

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

  const ld = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${v.brand} ${v.model}`,
    brand: { "@type": "Brand", name: v.brand },
    modelDate: String(v.year),
    vehicleTransmission: v.gearbox,
    fuelType: v.fuel,
    seatingCapacity: v.seats,
    mileageFromOdometer: { "@type": "QuantitativeValue", value: parseInt(v.mileage.replace(/\D/g, ""), 10), unitCode: "KMT" },
    offers: { "@type": "Offer", availability: "https://schema.org/InStock", priceCurrency: "XOF", price: "0", description: "Prix communiqué sur demande" },
  };

  return (
    <article className="section" style={{ paddingTop: "calc(var(--nav) + 40px)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="wrap">
        <Link href="/#parc" className="inline-flex items-center gap-2 text-[13px] mb-7" style={{ color: "var(--brand)" }}>
          <ArrowLeft className="w-4 h-4" /> Retour au parc
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_.9fr] lg:gap-12 lg:items-start">
          <div
            className="stage rounded-[var(--r4)] border grid place-items-center p-8"
            style={{ borderColor: "var(--line)", boxShadow: "var(--sh-m)" }}
          >
            <Silhouette body={v.body} className="w-full max-w-[560px]" />
          </div>

          <div>
            <span className="kicker">{v.status === "commande" ? `Sur commande · ${v.lead}` : "Disponible au showroom"}</span>
            <h1 className="h2 mt-4">{v.model}</h1>
            <p className="lead mt-3">{v.brand} · {v.origin}</p>

            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-px rounded-[var(--r2)] overflow-hidden border mt-7"
              style={{ background: "var(--line)", borderColor: "var(--line)" }}
            >
              {specs.map(([k, val]) => (
                <div key={k} className="p-3.5" style={{ background: "var(--surf)" }}>
                  <span className="block text-[9.5px] tracking-[.15em] uppercase" style={{ color: "var(--ink-3)" }}>{k}</span>
                  <b className="block mt-1.5 text-[14px] font-medium">{val}</b>
                </div>
              ))}
            </div>

            <h2 className="text-[12px] tracking-[.16em] uppercase font-medium mt-8 mb-3.5" style={{ color: "var(--brand)" }}>Équipements</h2>
            <ul className="grid sm:grid-cols-2 gap-2.5 list-none p-0 m-0">
              {v.equipment.map((e) => (
                <li key={e} className="flex gap-2.5 text-[13.5px]" style={{ color: "var(--ink-2)" }}>
                  <span className="shrink-0 mt-[3px]" style={{ color: "#2FBB74" }}><Check className="w-[15px] h-[15px]" /></span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>

            <h2 className="text-[12px] tracking-[.16em] uppercase font-medium mt-8 mb-3" style={{ color: "var(--brand)" }}>Le mot de BMA</h2>
            <p className="lead">{v.note}</p>

            <div
              className="p-4 px-[18px] rounded-[var(--r2)] border text-[13px] mt-7"
              style={{ background: "var(--surf-2)", borderColor: "var(--line-2)", color: "var(--ink-2)" }}
            >
              <b style={{ color: "var(--ink)", fontWeight: 500 }}>Prix communiqué sur demande.</b> Le tarif dépend de
              l&apos;état exact du véhicule et de votre mode de paiement.
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-6">
              <a href={`tel:${site.phone}`} className="btn btn--primary"><Phone /> Appeler</a>
              <a href={waVehicle(v.brand, v.model, v.year)} target="_blank" rel="noopener" className="btn btn--wa">
                <WhatsApp /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
