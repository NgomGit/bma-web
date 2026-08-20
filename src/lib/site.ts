/**
 * Configuration de la maison.
 * ⚠️ À REMPLACER avant mise en ligne : téléphone, adresse, coordonnées GPS.
 */
export const site = {
  name: "BMA",
  legalName: "Baye Mor Automobile",
  tagline: "Concessionnaire à Dakar",
  url: "https://bma-automobile.sn",

  // repris de la fiche Google Business vérifiée de l'établissement
  phone: "+221710748281",
  phoneDisplay: "+221 71 074 82 81",
  whatsapp: "221710748281",

  address: {
    street: "En face de l'entrée du péage, croisement Cambérène",
    city: "Dakar",
    country: "SN",
    countryName: "Sénégal",
  },
  hours: "Lun – Sam · 8h30 – 19h30",
  hoursNote: "Dimanche sur rendez-vous",

  /**
   * Lien de partage de la fiche Google, et itinéraire.
   * L'itinéraire passe par l'API d'URL universelle de Google Maps : elle ouvre
   * l'application native sur téléphone et le site sur ordinateur, sans clé.
   */
  maps: "https://share.google/qFS5gwiI0GvzN9yxx",
  directions:
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent("Baye Mor Automobile BMA, croisement Cambérène, Dakar"),

  /** Note publique de la fiche Google — à réactualiser quand elle bouge */
  rating: { score: "5,0", count: 3 },
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
  { href: "/vehicules", label: "Nos voitures", index: "01" },
  { href: "/import-voiture-dakar", label: "Import", index: "02" },
  { href: "/#contact", label: "Contact", index: "03" },
] as const;
