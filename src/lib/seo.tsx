import type { Metadata } from "next";
import { type Vehicle } from "@/data/vehicles";
import { site } from "./site";

/**
 * Fabrique de métadonnées et de données structurées.
 *
 * Principe directeur : le balisage ne déclare QUE ce qui est visible sur la page.
 * Google sanctionne les données structurées qui ne correspondent pas au contenu.
 * Aucun prix plancher n'est donc déclaré ici : il n'est plus affiché nulle part.
 */

const DEALER_ID = `${site.url}/#concessionnaire`;

export function meta({
  title,
  description,
  path,
  keywords,
  images,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  images?: string[];
}): Metadata {
  const url = `${site.url}${path}`;
  return {
    // `absolute` : le gabarit « — BMA Automobile » n'est pas ajouté.
    // Les titres sont écrits complets et calibrés sous ~60 caractères,
    // sinon Google les tronque dans les résultats.
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "fr_SN",
      url,
      siteName: `${site.name} — ${site.legalName}`,
      title,
      description,
      ...(images ? { images } : {}),
    },
    twitter: { card: "summary_large_image", title, description, ...(images ? { images } : {}) },
  };
}

/* ------------------------------------------------------------- JSON-LD ----- */

/** Le concessionnaire — nœud racine référencé par toutes les autres entités */
export function dealerLd() {
  return {
    "@type": "AutoDealer",
    "@id": DEALER_ID,
    name: `${site.name} — ${site.legalName}`,
    alternateName: [site.name, site.legalName],
    url: site.url,
    telephone: site.phone,
    hasMap: site.maps,
    image: `${site.url}/icon.svg`,
    description:
      "Concessionnaire automobile à Dakar. Véhicules d'occasion vérifiés, papiers en règle, essai avant achat et import sur commande depuis le Japon, Dubaï et l'Europe.",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressCountry: site.address.country,
    },
    areaServed: [
      { "@type": "City", name: "Dakar" },
      { "@type": "Country", name: "Sénégal" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:30",
        closes: "19:30",
      },
    ],
    priceRange: "$$$",
    currenciesAccepted: "XOF",
    knowsLanguage: ["fr", "wo"],
    makesOffer: {
      "@type": "Offer",
      itemOffered: { "@type": "Car" },
      priceCurrency: "XOF",
    },
  };
}

/** Fil d'Ariane — affiché ET balisé */
export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${site.url}${t.path}`,
    })),
  };
}

/** Un véhicule — type `Vehicle`, plus précis que `Car` pour l'occasion */
export function vehicleLd(v: Vehicle) {
  const km = Number(v.mileage.replace(/\D/g, "")) || undefined;
  return {
    "@type": "Vehicle",
    "@id": `${site.url}/vehicules/${v.slug}#vehicule`,
    name: `${v.brand} ${v.model} ${v.year}`,
    url: `${site.url}/vehicules/${v.slug}`,
    brand: { "@type": "Brand", name: v.brand },
    model: v.model,
    vehicleModelDate: String(v.year),
    productionDate: String(v.year),
    bodyType: v.bodywork,
    color: v.color,
    vehicleTransmission: v.gearbox,
    fuelType: v.fuel,
    driveWheelConfiguration: v.drivetrain,
    vehicleSeatingCapacity: v.seats,
    // Motorisation et puissance sont facultatives : on n'émet la propriété que
    // si l'on a quelque chose à y mettre, plutôt qu'un « · » orphelin.
    ...(v.engine?.trim() || v.power?.trim()
      ? {
          vehicleEngine: {
            "@type": "EngineSpecification",
            name: [v.engine, v.power].map((s) => s?.trim()).filter(Boolean).join(" · "),
          },
        }
      : {}),
    itemCondition: "https://schema.org/UsedCondition",
    ...(km ? { mileageFromOdometer: { "@type": "QuantitativeValue", value: km, unitCode: "KMT" } } : {}),
    ...(v.photos?.length ? { image: v.photos.map((p) => `${site.url}${p}`) } : {}),
    offers: {
      "@type": "Offer",
      "@id": `${site.url}/vehicules/${v.slug}#offre`,
      // tout le parc est physiquement au showroom
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      priceCurrency: "XOF",
      // un prix n'est déclaré que s'il est réellement affiché sur la page
      ...(v.price
        ? { price: v.price }
        : {
            priceSpecification: {
              "@type": "PriceSpecification",
              priceCurrency: "XOF",
              description: "Prix communiqué sur demande, par téléphone ou WhatsApp",
            },
          }),
      seller: { "@id": DEALER_ID },
      availableAtOrFrom: {
        "@type": "Place",
        name: `${site.name} — ${site.address.city}`,
        address: { "@type": "PostalAddress", addressLocality: site.address.city, addressCountry: site.address.country },
      },
    },
  };
}

/** Une liste de véhicules — pages catalogue, marque et catégorie */
export function itemListLd(vehicles: Vehicle[], path: string, name: string) {
  return {
    "@type": "ItemList",
    "@id": `${site.url}${path}#liste`,
    name,
    numberOfItems: vehicles.length,
    itemListElement: vehicles.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${site.url}/vehicules/${v.slug}`,
      name: `${v.brand} ${v.model} ${v.year}`,
    })),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Assemble un graphe JSON-LD unique — un seul script par page */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/** Composant serveur : insère le graphe dans la page */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
