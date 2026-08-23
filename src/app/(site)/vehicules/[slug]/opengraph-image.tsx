import { ImageResponse } from "next/og";
import { promises as fs } from "node:fs";
import path from "node:path";
import { SILHOUETTES } from "@/components/brand/paths";
import { getVehicle, getVehicles } from "@/lib/store";
import { formatPrice } from "@/data/vehicles";
import { site } from "@/lib/site";

/**
 * Image de partage générée pour chaque véhicule.
 *
 * Au Sénégal, une fiche voiture circule d'abord sur WhatsApp. Sans cette image,
 * le lien s'affiche en petit texte gris ; avec elle, il devient une carte
 * lisible qui donne envie d'ouvrir. C'est le format le plus rentable du SEO
 * social pour un concessionnaire.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Véhicule disponible chez BMA — Baye Mor Automobile, Dakar";

export async function generateStaticParams() {
  return (await getVehicles()).map((v) => ({ slug: v.slug }));
}

/**
 * Satori (le moteur d'ImageResponse) ne lit ni woff ni woff2 : il lui faut du
 * TTF ou de l'OTF. Ces deux fichiers sont des sous-ensembles latins de Poppins,
 * réservés à la génération d'images — la police du site reste en woff2.
 */
const font = (name: string) =>
  fs.readFile(path.join(process.cwd(), "public", "fonts", name));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = await getVehicle(slug);
  const [bold, medium] = await Promise.all([font("og-bold.ttf"), font("og-medium.ttf")]);

  if (!v) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", background: "#050E1C" }} />,
      size,
    );
  }

  const p = SILHOUETTES[v.body];
  const flip = v.body === "pickup";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(140deg, #0E2444 0%, #050E1C 62%)",
          padding: "44px 60px 40px",
          fontFamily: "Poppins",
          color: "#EEF4FB",
          position: "relative",
        }}
      >
        {/* en-tête : marque de la maison + statut */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56, height: 56, borderRadius: 14, display: "flex",
                alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg,#3AA5F5,#08356B)",
                fontSize: 20, fontWeight: 700, letterSpacing: 1,
              }}
            >
              BMA
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1.5 }}>BAYE MOR AUTOMOBILE</span>
              <span style={{ fontSize: 15, color: "#8AD6FF", letterSpacing: 3, marginTop: 2 }}>DAKAR · SÉNÉGAL</span>
            </div>
          </div>
          <div
            style={{
              display: "flex", alignItems: "center", padding: "10px 22px", borderRadius: 999,
              border: "1px solid rgba(138,214,255,.4)", background: "rgba(46,155,240,.14)",
              fontSize: 18, color: "#8AD6FF", fontWeight: 500,
            }}
          >
            Disponible
          </div>
        </div>

        {/* le véhicule */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg width="700" height="292" viewBox="0 0 240 100">
            <g
              fill="none"
              stroke="#5FC8FF"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform={flip ? "translate(240,0) scale(-1,1)" : undefined}
            >
              <path d={p.body} strokeWidth="7" />
              <path d={p.ground} strokeWidth="5" />
              <path d={p.belt} strokeWidth="3" opacity="0.45" />
            </g>
          </svg>
        </div>

        {/* pied : identité du véhicule + repères */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 20, color: "#2E9BF0", letterSpacing: 4, fontWeight: 500 }}>
            {v.brand.toUpperCase()}
          </span>
          <span style={{ fontSize: 54, fontWeight: 700, letterSpacing: -1.8, marginTop: 4 }}>{v.model}</span>
          <div style={{ display: "flex", gap: 14, marginTop: 16, alignItems: "center" }}>
            {[String(v.year), v.mileage, v.gearbox, v.fuel].map((t) => (
              <span
                key={t}
                style={{
                  display: "flex", padding: "8px 18px", borderRadius: 999,
                  border: "1px solid rgba(255,255,255,.16)", fontSize: 19, color: "#9CB2C8",
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 19, color: "#7B93AC", marginTop: 18 }}>
            {v.price ? formatPrice(v.price) : "Prix sur demande"} · {site.phoneDisplay}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Poppins", data: bold, weight: 700, style: "normal" },
        { name: "Poppins", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
