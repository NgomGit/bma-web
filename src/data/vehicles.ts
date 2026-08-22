export type BodyType = "suv" | "pickup" | "berline" | "crossover";

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
  origin: string;
  /** Prix en FCFA. Absent = « Prix sur demande » partout. */
  price?: number;
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

/**
 * Parc de départ.
 *
 * ⚠️ Ce tableau n'est PAS la source de vérité en fonctionnement : dès le premier
 * démarrage, `src/lib/store.ts` le recopie dans `data/vehicles.json`, et c'est ce
 * fichier-là que le back-office modifie ensuite.
 *
 * Il compte quand même, parce que `data/*.json` est exclu de Git : sur un
 * déploiement neuf, le fichier n'existe pas et c'est ce tableau qui est écrit.
 * Il doit donc refléter le parc réel — sinon le site mis en ligne afficherait
 * un parc de démonstration.
 */
/**
 * Parc de départ.
 *
 * ⚠️ Ce tableau n'est PAS la source de vérité en fonctionnement : dès le premier
 * démarrage, `src/lib/store.ts` le recopie dans `data/vehicles.json`, et c'est ce
 * fichier-là que le back-office modifie ensuite.
 *
 * Il compte quand même, parce que `data/*.json` est exclu de Git : sur un
 * déploiement neuf, le fichier n'existe pas et c'est ce tableau qui est écrit.
 * Il doit donc refléter le parc réel — sinon le site mis en ligne afficherait
 * un parc de démonstration.
 */
export const seedVehicles: Vehicle[] = [
  {
    slug: "mercedes-benz-gle",
    brand: "Mercedes-Benz",
    model: "GLE 450 AMG Line",
    body: "suv",
    year: 2022,
    mileage: "38 000 km",
    gearbox: "Automatique",
    fuel: "Essence",
    seats: 5,
    engine: "3.0 six cylindres EQ Boost",
    power: "367 ch",
    color: "Vert émeraude métallisé",
    drivetrain: "4MATIC intégrale",
    bodywork: "SUV 5 portes",
    origin: "Importé de Belgique",
    price: 47000000,
    featured: true,
    swatches: ["#12291F", "#0B1712", "#C9B693", "#6E7A72"],
    note:
      "Celui-là ne ressemble à aucun autre GLE : le vert émeraude métallisé est une teinte rare, et on n'en croise pas deux à Dakar. Pack AMG Line complet, cuir beige macchiato, boiseries claires, éclairage d'ambiance et toit panoramique. C'est la voiture d'un client qui veut être vu sans en faire trop — un GLE ne crie pas, il s'impose.",
    equipment: [
      "Pack extérieur AMG Line, calandre diamant",
      "Jantes AMG multibranches, étriers apparents",
      "Six cylindres en ligne essence 367 ch, micro-hybridation EQ Boost",
      "Transmission intégrale 4MATIC",
      "Boîte automatique 9G-TRONIC",
      "Sellerie cuir beige macchiato",
      "Boiseries claires et éclairage d'ambiance 64 couleurs",
      "Double écran MBUX 12,3 pouces",
      "Toit ouvrant panoramique",
      "Hayon électrique",
      "Marchepieds latéraux",
      "Barres de toit",
      "Attelage remorque",
    ],
    photos: [
      "/vehicules/mercedes-benz-gle/01-cover.jpg",
      "/vehicules/mercedes-benz-gle/02-avant-trois-quarts.jpg",
      "/vehicules/mercedes-benz-gle/03-profil-arriere.jpg",
      "/vehicules/mercedes-benz-gle/04-planche-de-bord.jpg",
      "/vehicules/mercedes-benz-gle/05-sieges-arriere.jpg",
      "/vehicules/mercedes-benz-gle/06-coffre.jpg",
    ],
  },
  {
    slug: "bmw-x4-m40i",
    brand: "BMW",
    model: "X4 M40i",
    body: "crossover",
    year: 2020,
    mileage: "76 000 km",
    gearbox: "Automatique",
    fuel: "Essence",
    seats: 5,
    engine: "3.0 six cylindres en ligne biturbo",
    power: "354 ch",
    color: "Bleu Phytonic métallisé",
    drivetrain: "xDrive intégrale",
    bodywork: "SUV coupé 5 portes",
    origin: "Importé de Belgique — version européenne",
    price: 42000000,
    featured: true,
    swatches: ["#1E3A5F", "#0B1420", "#C8D3DE", "#7B8794"],
    note:
      "C'est la voiture qui fait tourner les têtes dans le showroom. Le M40i n'est pas un X4 avec un badge : six cylindres en ligne, 354 chevaux, châssis M Sport et xDrive. Elle arrive de Belgique, carnet suivi, carrosserie sans reprise de peinture. Pour qui veut un SUV qui se conduit comme une berline sportive.",
    equipment: [
      "Six cylindres en ligne 354 ch",
      "Transmission intégrale xDrive",
      "Boîte Steptronic 8 rapports au volant",
      "Modes de conduite Sport, Comfort, Adaptive et Eco Pro",
      "Sellerie cuir noir surpiqûre contrastée",
      "Sièges sport M électriques",
      "Cockpit numérique BMW Live Cockpit",
      "iDrive écran tactile et molette",
      "BMW Display Key (clé à écran)",
      "Aide au stationnement et caméra de recul",
      "Auto Hold et frein de parking électrique",
      "Jantes M double branches, freins M Sport",
    ],
    photos: [
      "/vehicules/bmw-x4-m40i/01-cover.jpg",
      "/vehicules/bmw-x4-m40i/02-face.jpg",
      "/vehicules/bmw-x4-m40i/03-back-zoomed.jpg",
      "/vehicules/bmw-x4-m40i/04-interior-driver-seat.jpg",
      "/vehicules/bmw-x4-m40i/05-boite-auto.jpg",
      "/vehicules/bmw-x4-m40i/06-interio-back-seat.jpg",
    ],
  },
  {
    slug: "ford-ranger-raptor-2022",
    brand: "Ford",
    model: "Ranger Raptor",
    body: "pickup",
    year: 2022,
    mileage: "56 000 km",
    gearbox: "Automatique",
    fuel: "Diesel",
    seats: 5,
    engine: "2.0 EcoBlue bi-turbo",
    power: "213 ch",
    color: "Gris Conquer, bandes rouges et noires",
    drivetrain: "4×4 enclenchable",
    bodywork: "Pick-up double cabine",
    origin: "Importé d'Europe",
    price: 32000000,
    featured: true,
    swatches: ["#8B9296", "#3A3F44", "#B3261E", "#12161A"],
    note:
      "Le même Raptor, deux ans plus jeune et bien moins roulé — avec en prime les bandes de capot rouges et noires qui le distinguent au premier coup d'œil. Châssis renforcé, amortisseurs Fox Racing et pneus tout-terrain d'origine : c'est le pick-up qui encaisse la piste sans se plaindre.",
    equipment: [
      "Amortisseurs Fox Racing 2.5 Internal Bypass",
      "Voies élargies et châssis renforcé",
      "4×4 avec réducteur et blocage de différentiel arrière",
      "Six modes Terrain Management",
      "Boîte automatique 10 rapports, palettes au volant",
      "Sièges baquets Raptor cuir et alcantara",
      "Bandes de capot rouges et noires",
      "Pneus tout-terrain, jantes 17 pouces",
      "Caméra de recul et radars de stationnement",
      "Écran tactile SYNC 3, Apple CarPlay et Android Auto",
    ],
    photos: [
      "/vehicules/ford-ranger-raptor-2022/01-cover.jpg",
      "/vehicules/ford-ranger-raptor-2022/02-face.jpg",
      "/vehicules/ford-ranger-raptor-2022/03-avant-trois-quarts.jpg",
      "/vehicules/ford-ranger-raptor-2022/04-sieges-raptor.jpg",
    ],
  },
  {
    slug: "ford-ranger-raptor",
    brand: "Ford",
    model: "Ranger Raptor",
    body: "pickup",
    year: 2020,
    mileage: "83 000 km",
    gearbox: "Automatique",
    fuel: "Diesel",
    seats: 5,
    engine: "2.0 EcoBlue bi-turbo",
    power: "213 ch",
    color: "Gris Conquer",
    drivetrain: "4×4 enclenchable",
    bodywork: "Pick-up double cabine",
    origin: "Importé d'Europe",
    price: 29000000,
    featured: true,
    swatches: ["#8B9296", "#3A3F44", "#12161A", "#C4C9CC"],
    note:
      "Le Raptor n'est pas un Ranger relevé : châssis renforcé, voies élargies, amortisseurs Fox Racing à réservoir séparé et pneus tout-terrain d'origine. C'est le pick-up qui encaisse la piste à vitesse soutenue sans se plaindre. Celui-ci est équipé barre LED de toit, couvre-benne et marchepieds.",
    equipment: [
      "Amortisseurs Fox Racing 2.5 Internal Bypass",
      "Voies élargies et châssis renforcé",
      "4×4 avec réducteur et blocage de différentiel arrière",
      "Six modes Terrain Management",
      "Boîte automatique 10 rapports, palettes au volant",
      "Sièges baquets Raptor cuir et alcantara",
      "Pneus tout-terrain BFGoodrich, jantes 17 pouces",
      "Barre LED de toit",
      "Couvre-benne roulant",
      "Marchepieds latéraux et protection sous moteur",
      "Caméra de recul et radars de stationnement",
      "Écran tactile SYNC 3, Apple CarPlay et Android Auto",
    ],
    photos: [
      "/vehicules/ford-ranger-raptor/01-cover.jpg",
      "/vehicules/ford-ranger-raptor/02-front-view.jpg",
      "/vehicules/ford-ranger-raptor/03-back-view.jpg",
      "/vehicules/ford-ranger-raptor/04-side-view-zoomed.jpg",
      "/vehicules/ford-ranger-raptor/05-interior-front-seat.jpg",
      "/vehicules/ford-ranger-raptor/06-interior-back-seat.jpg",
    ],
  },
  {
    slug: "range-rover-sport",
    brand: "Land Rover",
    model: "Range Rover Sport",
    body: "suv",
    year: 2016,
    mileage: "69 000 km",
    gearbox: "Automatique",
    fuel: "Diesel",
    seats: 7,
    engine: "3.0 SDV6",
    power: "306 ch",
    color: "Gris Corris métallisé",
    drivetrain: "4×4 permanent",
    bodywork: "SUV 5 portes",
    origin: "Importé d'Europe",
    price: 18500000,
    featured: true,
    swatches: ["#5C6167", "#2B2F34", "#D2D7DC", "#8E959C"],
    note:
      "Le Range Rover Sport reste la référence quand on veut du prestige sans renoncer au tout-terrain. Suspension pneumatique, Terrain Response, troisième rangée escamotable et un intérieur cuir tan qui a très bien vieilli. C'est le véhicule que nos clients choisissent pour rouler en ville la semaine et partir en région le week-end.",
    equipment: [
      "V6 diesel 3.0 SDV6, 306 ch",
      "Suspension pneumatique à hauteur variable",
      "Terrain Response et réducteur",
      "Troisième rangée escamotable, 7 places",
      "Sellerie cuir tan perforé",
      "Sièges avant électriques à mémoire",
      "Toit ouvrant panoramique",
      "Hayon électrique",
      "Jantes alliage 21 pouces",
      "Caméra de recul et aide au stationnement",
      "Climatisation quadri-zone",
      "Attelage remorque",
    ],
    photos: [
      "/vehicules/range-rover-sport/01-cover.jpg",
      "/vehicules/range-rover-sport/02-side-view-1.jpg",
      "/vehicules/range-rover-sport/03-back-view.jpg",
      "/vehicules/range-rover-sport/04-interior-driver-front-view.jpg",
      "/vehicules/range-rover-sport/05-interior-back-seat-view.jpg",
      "/vehicules/range-rover-sport/06-male.jpg",
    ],
  },
  {
    slug: "mitsubishi-pajero-long",
    brand: "Mitsubishi",
    model: "Pajero Long",
    body: "suv",
    year: 2017,
    mileage: "96 000 km",
    gearbox: "Automatique",
    fuel: "Diesel",
    seats: 7,
    engine: "3.2 DI-D",
    power: "190 ch",
    color: "Noir",
    drivetrain: "Super Select 4WD II",
    bodywork: "SUV 5 portes",
    origin: "Importé d'Europe",
    swatches: ["#0D0D0F", "#3A3D42", "#B9C0C7", "#6E7378"],
    note:
      "Le Pajero est le 4×4 des gens qui roulent vraiment. Châssis à longerons, Super Select qui passe du 2 roues motrices au 4×4 en roulant, 3.2 diesel réputé increvable et des pièces qu'on trouve partout au Sénégal. Version longue 7 places, cuir noir, pare-buffle et attelage déjà montés.",
    equipment: [
      "3.2 DI-D 190 ch, couple disponible bas",
      "Super Select 4WD II avec réducteur",
      "Blocage de différentiel central",
      "7 places, troisième rangée escamotable",
      "Sellerie cuir noir",
      "Système audio Rockford Fosgate",
      "Écran tactile avec navigation et caméra de recul",
      "Climatisation automatique avec commandes arrière",
      "Régulateur de vitesse",
      "Pare-buffle chromé et marchepieds",
      "Barres de toit et attelage",
      "Jantes alliage 18 pouces",
    ],
    photos: [
      "/vehicules/mitsubishi-pajero-long/01-cover.jpg",
      "/vehicules/mitsubishi-pajero-long/02-back-view.jpg",
      "/vehicules/mitsubishi-pajero-long/03-interior-front-seat.jpg",
      "/vehicules/mitsubishi-pajero-long/04-interior-back-seat.jpg",
    ],
  },
];

export const filters = [
  { key: "tous", label: "Tous" },
  { key: "suv", label: "SUV & 4×4" },
  { key: "pickup", label: "Pick-up" },
  { key: "berline", label: "Berlines" },
  { key: "crossover", label: "Crossovers" },
] as const;

export type FilterKey = (typeof filters)[number]["key"];

export const matches = (v: Vehicle, key: FilterKey) =>
  key === "tous" ? true : v.body === key;

export const countFor = (list: Vehicle[], key: FilterKey) => list.filter((v) => matches(v, key)).length;

export const BODY_LABELS: Record<BodyType, string> = {
  suv: "SUV & 4×4",
  pickup: "Pick-up",
  berline: "Berline",
  crossover: "Crossover",
};

/* ------------------------------------------------------------------ SEO ---- */

/** Prix plancher du parc, en FCFA. Sert au positionnement et aux données structurées. */
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

/** « 28 500 000 FCFA » — espaces insécables fines, comme en typographie française */
export const formatPrice = (xof: number) =>
  `${new Intl.NumberFormat("fr-FR").format(xof).replace(/\u202f|\u00a0/g, " ")} FCFA`;
