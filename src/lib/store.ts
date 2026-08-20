import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { seedVehicles, type Vehicle } from "@/data/vehicles";

/**
 * Stockage des véhicules.
 *
 * Le contenu vit dans `data/vehicles.json`, à la racine du projet — pas dans le
 * code. Le fichier est créé au premier démarrage à partir de `seedVehicles`.
 *
 * ⚠️ Ce store écrit sur le disque : il fonctionne en local et sur tout
 * hébergement Node persistant (VPS, Render, Railway, Dokku…). Il ne fonctionne
 * PAS sur un hébergement serverless au système de fichiers en lecture seule
 * (Vercel, Netlify Functions). Pour ces plateformes, remplacer les cinq
 * fonctions ci-dessous par des requêtes vers une base — c'est le seul fichier
 * à réécrire, le reste de l'application ne connaît que cette interface.
 */

const FILE = path.join(process.cwd(), "data", "vehicles.json");

async function read(): Promise<Vehicle[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Vehicle[];
  } catch {
    await write(seedVehicles);
    return seedVehicles;
  }
}

async function write(list: Vehicle[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  // écriture atomique : on écrit à côté puis on renomme — jamais de fichier tronqué
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(list, null, 2), "utf8");
  await fs.rename(tmp, FILE);
}

export async function getVehicles(): Promise<Vehicle[]> {
  return read();
}

export async function getVehicle(slug: string): Promise<Vehicle | undefined> {
  return (await read()).find((v) => v.slug === slug);
}

/** Crée ou met à jour — la clé est le slug */
export async function putVehicle(vehicle: Vehicle): Promise<void> {
  const list = await read();
  const i = list.findIndex((v) => v.slug === vehicle.slug);
  if (i === -1) list.unshift(vehicle);
  else list[i] = vehicle;
  await write(list);
}

export async function removeVehicle(slug: string): Promise<void> {
  await write((await read()).filter((v) => v.slug !== slug));
}

/**
 * Réécrit l'ordre du parc — l'ordre du fichier est l'ordre affiché sur le site.
 *
 * On repart de la liste stockée plutôt que de faire confiance au client : les
 * slugs inconnus sont ignorés, et tout véhicule absent de la liste reçue est
 * conservé à la fin. Un onglet resté ouvert sur une version périmée ne peut donc
 * pas supprimer un véhicule ajouté entre-temps.
 */
export async function setOrder(slugs: string[]): Promise<void> {
  const list = await read();
  const byslug = new Map(list.map((v) => [v.slug, v]));
  const ordered = slugs.map((s) => byslug.get(s)).filter((v): v is Vehicle => !!v);
  const seen = new Set(ordered.map((v) => v.slug));
  await write([...ordered, ...list.filter((v) => !seen.has(v.slug))]);
}

export function makeSlug(brand: string, model: string, year: number | string) {
  return `${brand} ${model} ${year}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
