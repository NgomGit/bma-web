#!/usr/bin/env node
/**
 * =============================================================================
 *  Reprise des données vers Supabase — à lancer UNE fois.
 * =============================================================================
 *
 *  Prérequis : avoir exécuté supabase/schema.sql dans Supabase → SQL Editor.
 *
 *  Usage :
 *    node scripts/migrate.mjs --email=vous@exemple.com --nom="Mouhamed Ngom"
 *    node scripts/migrate.mjs --email=... --nom="..." --mdp="MonMotDePasse1"
 *
 *  Ce que fait le script :
 *    1. vérifie que les tables existent
 *    2. crée le seau de photos s'il manque
 *    3. envoie les photos de public/vehicules/ vers Storage
 *    4. transfère data/vehicles.json vers la table `vehicles`
 *    5. crée votre compte superadmin, et affiche le mot de passe
 *
 *  Il est ré-exécutable : les photos et les véhicules sont écrasés par leur
 *  version la plus récente, et un compte existant n'est jamais recréé.
 * =============================================================================
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const ROOT = path.resolve(import.meta.dirname, "..");
const BUCKET = "vehicules";

/* --------------------------------------------------------------- utilitaires */

const c = {
  ok: (s) => `\x1b[32m${s}\x1b[0m`,
  warn: (s) => `\x1b[33m${s}\x1b[0m`,
  err: (s) => `\x1b[31m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  b: (s) => `\x1b[1m${s}\x1b[0m`,
};

function die(message, hint) {
  console.error(`\n${c.err("✗")} ${message}`);
  if (hint) console.error(`  ${c.dim(hint)}`);
  process.exit(1);
}

/** Lit .env.local sans dépendance : une ligne CLÉ=valeur, # pour commenter. */
async function loadEnv() {
  const file = path.join(ROOT, ".env.local");
  if (!existsSync(file)) die(".env.local introuvable.", "Copiez .env.example en .env.local et renseignez-le.");
  const env = {};
  for (const line of (await readFile(file, "utf8")).split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...rest] = a.replace(/^--/, "").split("=");
    return [k, rest.join("=") || true];
  }),
);

function generatePassword() {
  // Alphabet sans O/0 ni I/l — on va le dicter au téléphone. La boucle écarte
  // les tirages sans chiffre, qui seraient refusés par la règle du back-office.
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (;;) {
    const p = [...randomBytes(12)].map((b) => alphabet[b % alphabet.length]).join("");
    if (/[a-zA-Z]/.test(p) && /[0-9]/.test(p)) return p;
  }
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

/* --------------------------------------------------------------------- main */

const env = await loadEnv();
const URL_ = (env.SUPABASE_URL ?? "").replace(/\/$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SERVICE_ROLE_KEY ?? "";
if (!URL_ || !KEY) die("SUPABASE_URL ou SERVICE_ROLE_KEY manquant dans .env.local.");

const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function call(url, init = {}) {
  const res = await fetch(url, { ...init, headers: { ...H, ...(init.headers ?? {}) } });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { ok: res.ok, status: res.status, body };
}

console.log(`\n${c.b("Reprise vers Supabase")} ${c.dim(new URL(URL_).host)}\n`);

/* --- 1. les tables sont-elles là ? ---------------------------------------- */

const probe = await call(`${URL_}/rest/v1/vehicles?select=slug&limit=1`);
if (!probe.ok) {
  die(
    `La table « vehicles » est introuvable (${probe.status}).`,
    "Ouvrez Supabase → SQL Editor → New query, collez le contenu de supabase/schema.sql, puis Run.",
  );
}
const usersProbe = await call(`${URL_}/rest/v1/users?select=id`);
if (!usersProbe.ok) die(`La table « users » est introuvable (${usersProbe.status}).`, "Même remède : supabase/schema.sql.");
console.log(`${c.ok("✓")} Tables présentes.`);

/* --- 2. le seau de photos -------------------------------------------------- */

const buckets = await call(`${URL_}/storage/v1/bucket`);
if (!buckets.ok) die(`Storage injoignable (${buckets.status}).`);
if (!buckets.body.some((b) => b.name === BUCKET)) {
  const made = await call(`${URL_}/storage/v1/bucket`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // public : les photos sont servies directement par le CDN de Supabase,
    // sans URL signée à renouveler. Ce sont des photos d'annonces, elles ont
    // vocation à être vues.
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true, file_size_limit: 8388608 }),
  });
  if (!made.ok) die(`Création du seau impossible : ${JSON.stringify(made.body)}`);
  console.log(`${c.ok("✓")} Seau « ${BUCKET} » créé (public).`);
} else {
  console.log(`${c.ok("✓")} Seau « ${BUCKET} » déjà là.`);
}

/* --- 3. les photos --------------------------------------------------------- */

const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif" };
const publicUrl = (obj) => `${URL_}/storage/v1/object/public/${BUCKET}/${obj}`;

/** chemin local « /vehicules/slug/01.jpg » → URL Storage */
const uploaded = new Map();
const photosDir = path.join(ROOT, "public", "vehicules");

if (existsSync(photosDir)) {
  for (const slug of await readdir(photosDir)) {
    const dir = path.join(photosDir, slug);
    if (!(await stat(dir)).isDirectory()) continue;

    for (const file of await readdir(dir)) {
      const ext = path.extname(file).toLowerCase();
      if (!MIME[ext]) continue;

      const object = `${slug}/${file}`;
      const res = await call(`${URL_}/storage/v1/object/${BUCKET}/${object}`, {
        method: "POST",
        headers: { "Content-Type": MIME[ext], "x-upsert": "true", "cache-control": "31536000" },
        body: await readFile(path.join(dir, file)),
      });
      if (!res.ok) die(`Envoi de ${object} impossible : ${JSON.stringify(res.body)}`);
      uploaded.set(`/vehicules/${object}`, publicUrl(object));
      process.stdout.write(`  ${c.dim(object)}\n`);
    }
  }
}
console.log(`${c.ok("✓")} ${uploaded.size} photo(s) dans Storage.`);

/* --- 4. le parc ------------------------------------------------------------ */

const jsonFile = path.join(ROOT, "data", "vehicles.json");
if (!existsSync(jsonFile)) die("data/vehicles.json introuvable — rien à reprendre.");
const vehicles = JSON.parse(await readFile(jsonFile, "utf8"));

const rows = vehicles.map((v, i) => ({
  slug: v.slug,
  position: i,
  brand: v.brand,
  model: v.model,
  body: v.body ?? "suv",
  year: v.year,
  mileage: v.mileage ?? "",
  gearbox: v.gearbox ?? "",
  fuel: v.fuel ?? "",
  seats: v.seats ?? 5,
  engine: v.engine ?? "",
  power: v.power ?? "",
  color: v.color ?? "",
  drivetrain: v.drivetrain ?? "",
  bodywork: v.bodywork ?? "",
  origin: v.origin ?? "",
  price: v.price ?? null,
  swatches: v.swatches ?? [],
  note: v.note ?? "",
  equipment: v.equipment ?? [],
  featured: v.featured ?? false,
  // Les chemins locaux deviennent des URL Storage. Un chemin sans équivalent
  // envoyé (photo supprimée du disque entre-temps) est écarté plutôt que
  // recopié : il pointerait vers un fichier qui n'existe plus.
  photos: (v.photos ?? []).map((p) => uploaded.get(p)).filter(Boolean),
}));

const missing = vehicles.flatMap((v) => (v.photos ?? []).filter((p) => !uploaded.has(p)));
if (missing.length) console.log(`${c.warn("!")} ${missing.length} photo(s) référencée(s) sans fichier :\n  ${missing.join("\n  ")}`);

const put = await call(`${URL_}/rest/v1/vehicles?on_conflict=slug`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
  body: JSON.stringify(rows),
});
if (!put.ok) die(`Transfert du parc impossible : ${JSON.stringify(put.body)}`);
console.log(`${c.ok("✓")} ${rows.length} véhicule(s) en base.`);

/* --- 5. le compte superadmin ---------------------------------------------- */

const email = String(args.email ?? "").trim().toLowerCase();
const nom = String(args.nom ?? args.name ?? "").trim();

if (!email) {
  console.log(
    `\n${c.warn("!")} Aucun compte créé : relancez avec ${c.b("--email=vous@exemple.com --nom=\"Votre Nom\"")}`,
  );
  process.exit(0);
}

const already = await call(`${URL_}/rest/v1/users?select=id,role&email=eq.${encodeURIComponent(email)}`);
if (already.ok && already.body.length) {
  console.log(`\n${c.ok("✓")} Le compte ${email} existe déjà (${already.body[0].role}) — inchangé.`);
  process.exit(0);
}

const password = String(args.mdp ?? args.password ?? "") || generatePassword();
const created = await call(`${URL_}/rest/v1/users`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Prefer: "return=representation" },
  body: JSON.stringify({
    email,
    name: nom || email,
    role: "superadmin",
    active: true,
    password_hash: await hashPassword(password),
  }),
});
if (!created.ok) die(`Création du compte impossible : ${JSON.stringify(created.body)}`);

console.log(`
${c.ok("✓")} Compte superadmin créé.

   ${c.b("Email")}          ${email}
   ${c.b("Mot de passe")}   ${c.b(password)}

   ${c.dim("Notez-le : il n'est stocké que sous forme d'empreinte, personne ne peut le relire.")}
   ${c.dim("Changez-le à la première connexion depuis Back-office → votre nom → Mon compte.")}
`);
