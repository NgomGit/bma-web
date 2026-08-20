/**
 * Configuration de la maison.
 * ⚠️ À REMPLACER avant mise en ligne : téléphone, adresse, coordonnées GPS.
 */
export const site = {
  name: "BMA",
  legalName: "Baye Mor Automobile",
  tagline: "Concessionnaire à Dakar",
  url: "https://bma-automobile.sn",

  // ⚠️ numéro fictif — remplacer par le vrai
  phone: "+221770000000",
  phoneDisplay: "+221 77 000 00 00",
  whatsapp: "221770000000",

  address: {
    street: "Adresse exacte à compléter",
    city: "Dakar",
    country: "SN",
    countryName: "Sénégal",
  },
  hours: "Lun – Sam · 8h30 – 19h30",
  hoursNote: "Dimanche sur rendez-vous",
} as const;

export const wa = (message: string) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;

export const waGeneral = () =>
  wa("Bonjour Baye Mor, je vous contacte depuis le site BMA. J'aimerais des informations sur vos véhicules.");

export const waImport = () =>
  wa(
    "Bonjour Baye Mor, je souhaite commander un véhicule depuis l'étranger. Voici ce que je recherche : marque / modèle / année / boîte / budget.",
  );

export const waVehicle = (brand: string, model: string, year: number) =>
  wa(`Bonjour Baye Mor, je suis intéressé par la ${brand} ${model} (${year}) vue sur le site BMA. Est-elle toujours disponible ?`);

export const nav = [
  { href: "/vehicules", label: "Véhicules", index: "01" },
  { href: "/import-voiture-dakar", label: "Import", index: "02" },
  { href: "/#garanties", label: "Garanties", index: "03" },
  { href: "/#avis", label: "Avis", index: "04" },
  { href: "/#contact", label: "Contact", index: "05" },
] as const;
