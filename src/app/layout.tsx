import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/lib/site";
import "./globals.css";

const poppins = localFont({
  variable: "--font-poppins",
  display: "swap",
  src: [
    { path: "../../public/fonts/Poppins-Light.woff2", weight: "300", style: "normal" },
    { path: "../../public/fonts/Poppins-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Poppins-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Poppins-Bold.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.legalName} · ${site.tagline}`,
    template: `%s — ${site.name} Automobile`,
  },
  description:
    "BMA — Baye Mor Automobile, concessionnaire à Dakar. Véhicules vérifiés à prix affiché, papiers en règle, essai avant achat et import sur commande depuis l'étranger.",
  keywords: ["concessionnaire Dakar", "voiture Sénégal", "import véhicule Dakar", "SUV Dakar", "Baye Mor Automobile"],
  openGraph: {
    type: "website",
    locale: "fr_SN",
    siteName: `${site.name} Automobile`,
    title: `${site.name} — ${site.legalName}`,
    description: "Concessionnaire à Dakar. Véhicules vérifiés et import sur commande.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050E1C" },
    { media: "(prefers-color-scheme: light)", color: "#F1F5F9" },
  ],
};

/** Applique le thème avant le premier rendu — évite tout clignotement */
const themeScript = `(function(){try{var s=localStorage.getItem('bma-theme');var m=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.dataset.theme=s||m;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

/** Racine minimale : polices, thème, styles. Le chrome du site public vit dans (site), le back-office dans admin. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={poppins.variable}>{children}</body>
    </html>
  );
}
