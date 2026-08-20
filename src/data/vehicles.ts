export type BodyType = "suv" | "pickup" | "berline" | "crossover";
export type Availability = "disponible" | "commande";

export interface Vehicle {
  slug: string;
  brand: string;
  model: string;
  body: BodyType;
  year: number;
  mileage: string;
  gearbox: string;
  fuel: string;
  seats: number;
  engine: string;
  power: string;
  color: string;
  drivetrain: string;
  bodywork: string;
  status: Availability;
  origin: string;
  /** délai indicatif — uniquement pour les véhicules sur commande */
  lead?: string;
  /** teintes proposées, appliquées au tracé du véhicule */
  swatches: string[];
  /** commentaire de la maison, affiché dans l'onglet « Le mot de BMA » */
  note: string;
  equipment: string[];
  /** mis en avant dans le carrousel du hero et le rail « Sélection » */
  featured?: boolean;
  /**
   * ⚠️ PHOTOS — quand tu auras les vraies photos :
   * 1. dépose-les dans /public/vehicules/<slug>/01.jpg (ratio 16/9, ≥ 1600 px de large)
   * 2. renseigne le tableau ci-dessous
   * 3. <VehicleVisual> bascule automatiquement de la silhouette vers la photo
   */
  photos?: string[];
}

const SWATCHES = ["#8AD6FF", "#C8D3DE", "#1F2A36", "#7E6A55"];

export const seedVehicles: Vehicle[] = [
  {
    slug: "toyota-land-cruiser-prado-txl",
    brand: "Toyota",
    model: "Land Cruiser Prado TXL",
    body: "suv",
    year: 2019,
    mileage: "86 000 km",
    gearbox: "Automatique",
    fuel: "Diesel",
    seats: 7,
    engine: "2.8 D-4D",
    power: "177 ch",
    color: "Noir métallisé",
    drivetrain: "4×4 permanent",
    bodywork: "SUV 5 portes",
    status: "disponible",
    origin: "Importé du Japon",
    featured: true,
    swatches: SWATCHES,
    note:
      "Le Prado est le véhicule qui rassure le plus nos clients : il encaisse les routes de région sans broncher et se revend toujours bien. Celui-ci vient du Japon, entretien suivi, châssis sain.",
    equipment: [
      "Sièges cuir chauffants",
      "Caméra de recul 360°",
      "Climatisation tri-zone",
      "Toit ouvrant électrique",
      "Jantes alliage 18 pouces",
      "Régulateur de vitesse",
      "Bluetooth & Apple CarPlay",
      "Différentiel verrouillable",
    ],
  },
  {
    slug: "mercedes-benz-glc-250-4matic",
    brand: "Mercedes-Benz",
    model: "GLC 250 4MATIC",
    body: "suv",
    year: 2018,
    mileage: "94 000 km",
    gearbox: "Automatique",
    fuel: "Essence",
    seats: 5,
    engine: "2.0 Turbo",
    power: "211 ch",
    color: "Blanc nacré",
    drivetrain: "Transmission intégrale",
    bodywork: "SUV 5 portes",
    status: "disponible",
    origin: "Importé d'Allemagne",
    featured: true,
    swatches: SWATCHES,
    note:
      "Un GLC bien tenu, sans historique d'accident, avec le carnet complet. C'est le SUV premium le plus confortable de notre parc en ce moment.",
    equipment: [
      "Intérieur cuir Artico",
      "Écran COMAND 8 pouces",
      "Sellerie chauffante",
      "Hayon électrique",
      "Aide au stationnement",
      "Feux LED High Performance",
      "Jantes AMG 19 pouces",
      "Attelage remorque",
    ],
  },
  {
    slug: "toyota-hilux-double-cabine",
    brand: "Toyota",
    model: "Hilux Double Cabine",
    body: "pickup",
    year: 2021,
    mileage: "52 000 km",
    gearbox: "Manuelle",
    fuel: "Diesel",
    seats: 5,
    engine: "2.4 D-4D",
    power: "150 ch",
    color: "Gris acier",
    drivetrain: "4×4 enclenchable",
    bodywork: "Pick-up double cabine",
    status: "disponible",
    origin: "Importé de Dubaï",
    featured: true,
    swatches: SWATCHES,
    note:
      "Peu de kilomètres pour un Hilux, benne protégée, pneus tout-terrain neufs. Le choix évident pour qui roule entre Dakar et l'intérieur du pays.",
    equipment: [
      "Benne avec revêtement",
      "Barres de toit",
      "Climatisation",
      "Régulateur de vitesse",
      "Pneus tout-terrain neufs",
      "Marchepieds latéraux",
      "Attelage renforcé",
      "Vitres électriques",
    ],
  },
  {
    slug: "mitsubishi-pajero-sport-gls",
    brand: "Mitsubishi",
    model: "Pajero Sport GLS",
    body: "suv",
    year: 2020,
    mileage: "71 000 km",
    gearbox: "Automatique",
    fuel: "Diesel",
    seats: 7,
    engine: "2.4 DI-D",
    power: "181 ch",
    color: "Brun bronze",
    drivetrain: "Super Select 4WD",
    bodywork: "SUV 5 portes",
    status: "disponible",
    origin: "Importé de Dubaï",
    swatches: SWATCHES,
    note:
      "Sept places réellement utilisables et une transmission Super Select qui pardonne beaucoup. Un excellent rapport robustesse-confort.",
    equipment: [
      "Sièges cuir",
      "Caméra de recul",
      "Climatisation automatique",
      "Écran tactile 8 pouces",
      "Sept places modulables",
      "Jantes alliage 18 pouces",
      "Feux LED",
      "Démarrage sans clé",
    ],
  },
  {
    slug: "toyota-rav4-hybrid",
    brand: "Toyota",
    model: "RAV4 Hybrid",
    body: "crossover",
    year: 2020,
    mileage: "63 000 km",
    gearbox: "Automatique",
    fuel: "Hybride",
    seats: 5,
    engine: "2.5 Hybride",
    power: "218 ch",
    color: "Bleu profond",
    drivetrain: "Traction avant",
    bodywork: "Crossover 5 portes",
    status: "disponible",
    origin: "Importé du Japon",
    swatches: SWATCHES,
    note:
      "L'hybride prend tout son sens dans les embouteillages de Dakar : consommation divisée, moteur silencieux, entretien réduit.",
    equipment: [
      "Toyota Safety Sense",
      "Caméra de recul",
      "Hayon électrique",
      "Sièges chauffants",
      "Apple CarPlay & Android Auto",
      "Jantes 18 pouces",
      "Régulateur adaptatif",
      "Consommation réduite",
    ],
  },
  {
    slug: "mercedes-benz-classe-c-220-d",
    brand: "Mercedes-Benz",
    model: "Classe C 220 d",
    body: "berline",
    year: 2019,
    mileage: "78 000 km",
    gearbox: "Automatique",
    fuel: "Diesel",
    seats: 5,
    engine: "2.0 d",
    power: "194 ch",
    color: "Noir obsidienne",
    drivetrain: "Propulsion",
    bodywork: "Berline 4 portes",
    status: "disponible",
    origin: "Importé d'Allemagne",
    swatches: SWATCHES,
    note:
      "La berline de représentation par excellence. Intérieur impeccable, suspension confort, et un diesel qui consomme peu sur les longs trajets.",
    equipment: [
      "Sellerie cuir noir",
      "Éclairage d'ambiance 64 couleurs",
      "Écran 10,25 pouces",
      "Caméra de recul",
      "Suspension confort",
      "Jantes AMG 18 pouces",
      "Sièges à mémoire",
      "Régulateur adaptatif",
    ],
  },
  {
    slug: "land-rover-range-rover-evoque",
    brand: "Land Rover",
    model: "Range Rover Evoque",
    body: "crossover",
    year: 2019,
    mileage: "69 000 km",
    gearbox: "Automatique",
    fuel: "Diesel",
    seats: 5,
    engine: "2.0 TD4",
    power: "180 ch",
    color: "Gris Corris",
    drivetrain: "Transmission intégrale",
    bodywork: "Crossover 5 portes",
    status: "disponible",
    origin: "Importé du Royaume-Uni",
    swatches: SWATCHES,
    note:
      "Le plus élégant du parc. Nous l'avons pris parce que son dossier d'entretien était complet — sur un Evoque, c'est la seule chose qui compte.",
    equipment: [
      "Intérieur cuir Windsor",
      "Toit panoramique",
      "Système audio Meridian",
      "Caméra 360°",
      "Terrain Response",
      "Jantes 20 pouces",
      "Hayon mains libres",
      "Feux Matrix LED",
    ],
  },
  {
    slug: "toyota-land-cruiser-v8-vx",
    brand: "Toyota",
    model: "Land Cruiser V8 VX",
    body: "suv",
    year: 2017,
    mileage: "118 000 km",
    gearbox: "Automatique",
    fuel: "Diesel",
    seats: 8,
    engine: "4.5 V8 D-4D",
    power: "272 ch",
    color: "Blanc perle",
    drivetrain: "4×4 permanent",
    bodywork: "SUV 5 portes",
    status: "disponible",
    origin: "Importé de Dubaï",
    swatches: SWATCHES,
    note:
      "Le V8 reste la référence absolue pour les longues distances et les pistes. Kilométrage élevé mais mécanique suivie, ce qui compte davantage sur ce modèle.",
    equipment: [
      "Cuir beige ventilé",
      "Écrans arrière",
      "Suspension KDSS",
      "Caméra multi-terrain",
      "Huit places",
      "Réfrigérateur central",
      "Jantes 18 pouces",
      "Préparation treuil avant",
    ],
  },
  {
    slug: "bmw-x3-xdrive20d",
    brand: "BMW",
    model: "X3 xDrive20d",
    body: "suv",
    year: 2019,
    mileage: "82 000 km",
    gearbox: "Automatique",
    fuel: "Diesel",
    seats: 5,
    engine: "2.0 d",
    power: "190 ch",
    color: "Gris minéral",
    drivetrain: "xDrive intégral",
    bodywork: "SUV 5 portes",
    status: "commande",
    origin: "Recherche en Europe",
    lead: "délai estimé 45 jours",
    swatches: SWATCHES,
    note:
      "Nous pouvons vous en trouver un en Europe sous 45 jours, en Pack M Sport, avec rapport d'inspection avant achat.",
    equipment: [
      "Pack M Sport",
      "Sièges sport cuir",
      "Navigation Professional",
      "Hayon électrique",
      "Toit ouvrant",
      "Jantes 19 pouces",
      "Head-Up Display",
      "Caméra de recul",
    ],
  },
  {
    slug: "toyota-corolla-cross",
    brand: "Toyota",
    model: "Corolla Cross",
    body: "crossover",
    year: 2022,
    mileage: "34 000 km",
    gearbox: "Automatique",
    fuel: "Hybride",
    seats: 5,
    engine: "1.8 Hybride",
    power: "140 ch",
    color: "Argent lunaire",
    drivetrain: "Traction avant",
    bodywork: "Crossover 5 portes",
    status: "commande",
    origin: "Recherche au Japon",
    lead: "délai estimé 40 jours",
    swatches: SWATCHES,
    note:
      "Le meilleur compromis du moment pour un usage urbain : hybride, garantie encore active, et une revente qui tient.",
    equipment: [
      "Toyota Safety Sense 3",
      "Écran tactile 10,1 pouces",
      "Caméra de recul",
      "Climatisation automatique",
      "Jantes 17 pouces",
      "Feux LED",
      "Régulateur adaptatif",
      "Faible consommation",
    ],
  },
  {
    slug: "hyundai-santa-fe",
    brand: "Hyundai",
    model: "Santa Fe",
    body: "suv",
    year: 2021,
    mileage: "58 000 km",
    gearbox: "Automatique",
    fuel: "Diesel",
    seats: 7,
    engine: "2.2 CRDi",
    power: "202 ch",
    color: "Blanc glacier",
    drivetrain: "Transmission intégrale",
    bodywork: "SUV 5 portes",
    status: "commande",
    origin: "Recherche en Corée",
    lead: "délai estimé 50 jours",
    swatches: SWATCHES,
    note:
      "Sept places, équipement très complet et un prix d'import contenu. Le SUV familial le plus rationnel que nous commandons.",
    equipment: [
      "Sept places",
      "Toit panoramique",
      "Sièges cuir ventilés",
      "Caméra 360°",
      "Hayon intelligent",
      "Jantes 19 pouces",
      "Écran 10,25 pouces",
      "Chargeur à induction",
    ],
  },
  {
    slug: "toyota-camry-grande",
    brand: "Toyota",
    model: "Camry Grande",
    body: "berline",
    year: 2020,
    mileage: "61 000 km",
    gearbox: "Automatique",
    fuel: "Essence",
    seats: 5,
    engine: "2.5",
    power: "203 ch",
    color: "Noir attitude",
    drivetrain: "Traction avant",
    bodywork: "Berline 4 portes",
    status: "disponible",
    origin: "Importé de Dubaï",
    swatches: SWATCHES,
    note:
      "Une routière silencieuse, très bien équipée, avec la fiabilité Toyota. Le choix des chauffeurs qui font beaucoup de kilomètres.",
    equipment: [
      "Sièges cuir ventilés",
      "Écran tactile 9 pouces",
      "Caméra de recul",
      "Toit ouvrant",
      "Régulateur adaptatif",
      "Jantes 18 pouces",
      "Système audio JBL",
      "Démarrage sans clé",
    ],
  },
];

export const filters = [
  { key: "tous", label: "Tous" },
  { key: "suv", label: "SUV & 4×4" },
  { key: "pickup", label: "Pick-up" },
  { key: "berline", label: "Berlines" },
  { key: "crossover", label: "Crossovers" },
  { key: "commande", label: "Sur commande" },
] as const;

export type FilterKey = (typeof filters)[number]["key"];

export const matches = (v: Vehicle, key: FilterKey) =>
  key === "tous" ? true : key === "commande" ? v.status === "commande" : v.body === key;

export const countFor = (list: Vehicle[], key: FilterKey) => list.filter((v) => matches(v, key)).length;

export const BODY_LABELS: Record<BodyType, string> = {
  suv: "SUV & 4×4",
  pickup: "Pick-up",
  berline: "Berline",
  crossover: "Crossover",
};

/* ------------------------------------------------------------------ SEO ---- */

/** Prix plancher du parc, en FCFA. Sert au positionnement et aux données structurées. */
export const PRICE_FLOOR_XOF = 10_000_000;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const BODY_SLUGS: Record<BodyType, string> = {
  suv: "suv-4x4",
  pickup: "pick-up",
  berline: "berline",
  crossover: "crossover",
};

export const BODY_FROM_SLUG: Record<string, BodyType> = {
  "suv-4x4": "suv",
  "pick-up": "pickup",
  berline: "berline",
  crossover: "crossover",
};

/** Libellés au pluriel, utilisés dans les titres de pages de catégorie */
export const BODY_PLURAL: Record<BodyType, string> = {
  suv: "SUV et 4×4",
  pickup: "pick-up",
  berline: "berlines",
  crossover: "crossovers",
};

export const brandsOf = (list: Vehicle[]) =>
  [...new Set(list.map((v) => v.brand))].sort().map((brand) => ({
    brand,
    slug: slugify(brand),
    count: list.filter((v) => v.brand === brand).length,
  }));

export const bodiesOf = (list: Vehicle[]) =>
  (Object.keys(BODY_SLUGS) as BodyType[])
    .map((body) => ({
      body,
      slug: BODY_SLUGS[body],
      label: BODY_PLURAL[body],
      count: list.filter((v) => v.body === body).length,
    }))
    .filter((b) => b.count > 0);
