import "server-only";
import { seedVehicles, type BodyType, type Vehicle } from "@/data/vehicles";
import { sbDelete, sbSelect, sbUpsert, supabaseConfigured } from "./supabase";

/**
 * Stockage des véhicules — table `vehicles` de Supabase (PostgreSQL).
 *
 * Ce fichier reste, comme avant, le SEUL endroit de l'application qui sait où
 * vivent les données. Les six fonctions exportées n'ont pas changé de
 * signature : les pages publiques, le back-office et le plan du site les
 * appellent exactement comme du temps du fichier JSON.
 *
 * Pourquoi une base plutôt qu'un fichier : le back-office écrit. Sur Vercel, le
 * disque d'une fonction est en lecture seule — chaque enregistrement se
 * terminait par une page noire « A server error occurred », et rien n'était
 * sauvegardé. Une base est écrite depuis n'importe quel hébergeur, survit aux
 * déploiements, et se sauvegarde toute seule.
 */

const TABLE = "vehicles";

/** La ligne telle qu'elle vit en base : mêmes noms, plus l'ordre d'affichage. */
type Row = Omit<Vehicle, "price" | "photos" | "featured" | "body"> & {
  position: number;
  body: string;
  price: number | null;
  featured: boolean;
  photos: string[];
  created_at?: string;
  updated_at?: string;
};

/**
 * Ligne → véhicule.
 *
 * Un prix `NULL` redevient `undefined`, ce que tout le site interprète déjà
 * comme « Prix sur demande ». Sans cette conversion, `v.price` vaudrait `null`,
 * qui est faux en booléen mais bien présent dans un `JSON.stringify` — de quoi
 * faire apparaître « null FCFA » un jour où l'on s'y attend le moins.
 */
function toVehicle(r: Row): Vehicle {
  return {
    slug: r.slug,
    brand: r.brand,
    model: r.model,
    body: r.body as BodyType,
    year: r.year,
    mileage: r.mileage,
    gearbox: r.gearbox,
    fuel: r.fuel,
    seats: r.seats,
    engine: r.engine,
    power: r.power,
    color: r.color,
    drivetrain: r.drivetrain,
    bodywork: r.bodywork,
    origin: r.origin,
    swatches: r.swatches,
    note: r.note,
    equipment: r.equipment,
    featured: r.featured,
    photos: r.photos,
    ...(r.price === null ? {} : { price: r.price }),
  };
}

/** Véhicule → ligne. `position` est géré à part, il n'appartient pas au métier. */
function toRow(v: Vehicle, position: number): Row {
  return {
    ...v,
    position,
    price: v.price ?? null,
    featured: v.featured ?? false,
    swatches: v.swatches ?? [],
    equipment: v.equipment ?? [],
    photos: v.photos ?? [],
  };
}

/**
 * Filet de sécurité : tant que les variables Supabase ne sont pas renseignées,
 * le site public affiche le parc de départ au lieu de tomber en erreur. Un
 * site en lecture seule vaut mieux qu'une page 500 pendant une configuration.
 */
function unconfigured(): Vehicle[] {
  console.warn("[store] SUPABASE_URL / SERVICE_ROLE_KEY absents — parc de départ servi en lecture seule.");
  return seedVehicles;
}

export async function getVehicles(): Promise<Vehicle[]> {
  if (!supabaseConfigured) return unconfigured();
  const rows = await sbSelect<Row>(TABLE, { order: "position.asc,created_at.desc" });
  return rows.map(toVehicle);
}

export async function getVehicle(slug: string): Promise<Vehicle | undefined> {
  if (!supabaseConfigured) return unconfigured().find((v) => v.slug === slug);
  const rows = await sbSelect<Row>(TABLE, { slug: `eq.${slug}`, limit: 1 });
  return rows[0] ? toVehicle(rows[0]) : undefined;
}

/**
 * Crée ou met à jour — la clé est le slug.
 *
 * Une création se place en tête du parc, comme le faisait `unshift` sur le
 * tableau JSON : la voiture qu'on vient de saisir est celle qu'on veut voir en
 * premier. Une modification conserve la position acquise.
 */
export async function putVehicle(vehicle: Vehicle): Promise<void> {
  const existing = await sbSelect<{ position: number }>(TABLE, {
    slug: `eq.${vehicle.slug}`,
    select: "position",
    limit: 1,
  });

  let position: number;
  if (existing[0]) {
    position = existing[0].position;
  } else {
    const first = await sbSelect<{ position: number }>(TABLE, {
      select: "position",
      order: "position.asc",
      limit: 1,
    });
    position = (first[0]?.position ?? 0) - 1;
  }

  await sbUpsert(TABLE, toRow(vehicle, position), { onConflict: "slug", returning: false });
}

export async function removeVehicle(slug: string): Promise<void> {
  await sbDelete(TABLE, { slug: `eq.${slug}` });
}

/**
 * Réécrit l'ordre du parc — l'ordre en base est l'ordre affiché sur le site.
 *
 * On repart de la liste stockée plutôt que de faire confiance au client : les
 * slugs inconnus sont ignorés, et tout véhicule absent de la liste reçue est
 * conservé à la fin. Un onglet resté ouvert sur une version périmée ne peut donc
 * pas faire disparaître un véhicule ajouté entre-temps.
 */
export async function setOrder(slugs: string[]): Promise<void> {
  const rows = await sbSelect<Row>(TABLE, { order: "position.asc,created_at.desc" });
  const byslug = new Map(rows.map((r) => [r.slug, r]));

  const ordered = slugs.map((s) => byslug.get(s)).filter((r): r is Row => !!r);
  const seen = new Set(ordered.map((r) => r.slug));
  const final = [...ordered, ...rows.filter((r) => !seen.has(r.slug))];

  /**
   * On renvoie les lignes ENTIÈRES, pas seulement `{ slug, position }`.
   *
   * PostgREST traduit un « insérer ou mettre à jour » en `INSERT … ON CONFLICT
   * DO UPDATE`. PostgreSQL construit d'abord la ligne candidate et vérifie ses
   * contraintes — donc un envoi partiel échoue sur `brand`, `model` et `year`,
   * qui sont NOT NULL, avant même que le conflit ne soit détecté. Le parc est
   * déjà chargé juste au-dessus : le renvoyer en entier ne coûte rien et rend
   * l'écriture atomique, en une seule requête.
   */
  await sbUpsert(
    TABLE,
    final.map((row, i) => ({ ...row, position: i })),
    { onConflict: "slug", returning: false },
  );
}

export function makeSlug(brand: string, model: string, year: number | string) {
  return `${brand} ${model} ${year}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
