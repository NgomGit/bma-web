#!/usr/bin/env node
/**
 * =============================================================================
 *  État des lieux Supabase — lecture seule, ne modifie rien.
 * =============================================================================
 *
 *  Usage :  node scripts/check.mjs
 *
 *  Répond à quatre questions :
 *    · les tables existent-elles ?
 *    · le seau de photos existe-t-il, et combien de fichiers contient-il ?
 *    · les véhicules sont-ils en base, et leurs photos pointent-elles vers
 *      Storage ou encore vers l'ancien dossier public/vehicules/ ?
 *    · quels comptes ont accès au back-office ?
 *
 *  À lancer aussi bien après la migration que le jour où quelque chose cloche.
 * =============================================================================
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const c = {
  ok: (s) => `\x1b[32m${s}\x1b[0m`,
  ko: (s) => `\x1b[31m${s}\x1b[0m`,
  warn: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  b: (s) => `\x1b[1m${s}\x1b[0m`,
};

const file = path.join(ROOT, ".env.local");
if (!existsSync(file)) {
  console.error(c.ko("✗ .env.local introuvable."));
  process.exit(1);
}

const env = {};
for (const line of (await readFile(file, "utf8")).split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const URL_ = (env.SUPABASE_URL ?? "").replace(/\/$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SERVICE_ROLE_KEY ?? "";
if (!URL_ || !KEY) {
  console.error(c.ko("✗ SUPABASE_URL ou SERVICE_ROLE_KEY manquant dans .env.local."));
  process.exit(1);
}

const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const get = async (url) => {
  try {
    const r = await fetch(url, { headers: H });
    const t = await r.text();
    let body = null;
    try { body = t ? JSON.parse(t) : null; } catch { body = t; }
    return { ok: r.ok, status: r.status, body };
  } catch (e) {
    return { ok: false, status: 0, body: e.message };
  }
};

console.log(`\n${c.b("État des lieux")} ${c.dim(new URL(URL_).host)}\n`);

/* -------------------------------------------------------------- 1. tables */

const v = await get(`${URL_}/rest/v1/vehicles?select=slug,position,photos,price&order=position.asc`);
if (!v.ok) {
  console.log(`${c.ko("✗")} Table « vehicles » : ${v.status || "réseau injoignable"} ${c.dim(JSON.stringify(v.body).slice(0, 160))}`);
  console.log(`  ${c.dim("→ Supabase → SQL Editor → coller supabase/schema.sql → Run")}\n`);
  process.exit(1);
}
console.log(`${c.ok("✓")} Table « vehicles » : ${c.b(String(v.body.length))} véhicule(s)`);

/* --------------------------------------------------------------- 2. seau */

const buckets = await get(`${URL_}/storage/v1/bucket`);
const seau = Array.isArray(buckets.body) ? buckets.body.find((b) => b.name === "vehicules") : null;
if (!seau) {
  console.log(`${c.ko("✗")} Seau « vehicules » absent — les photos ne sont pas envoyées.`);
} else {
  // on liste le contenu dossier par dossier : un par véhicule
  let total = 0;
  for (const row of v.body) {
    const r = await fetch(`${URL_}/storage/v1/object/list/vehicules`, {
      method: "POST",
      headers: { ...H, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: `${row.slug}/`, limit: 200 }),
    });
    if (r.ok) total += (await r.json()).length;
  }
  console.log(`${c.ok("✓")} Seau « vehicules » : ${c.b(String(total))} fichier(s), ${seau.public ? "public" : c.warn("PRIVÉ — les photos ne s'afficheront pas")}`);
}

/* ------------------------------------------------------------- 3. photos */

console.log(`\n${c.b("Photos par véhicule")}`);
let localesRestantes = 0;
for (const row of v.body) {
  const photos = row.photos ?? [];
  const surStorage = photos.filter((p) => p.includes("/storage/v1/object/public/")).length;
  const locales = photos.length - surStorage;
  localesRestantes += locales;
  // On aligne sur le texte nu : les codes couleur comptent dans `padEnd`
  // et décaleraient les colonnes d'une dizaine de caractères invisibles.
  const brut = photos.length === 0 ? "aucune photo"
    : locales === 0 ? `${surStorage} sur Storage`
    : `${surStorage} sur Storage, ${locales} encore en chemin local`;
  const teinte = photos.length === 0 ? c.warn : locales === 0 ? c.ok : c.warn;
  const prix = row.price ? `${new Intl.NumberFormat("fr-FR").format(row.price)} FCFA` : "prix sur demande";
  console.log(`  ${row.slug.padEnd(26)} ${teinte(brut.padEnd(38))} ${row.price ? prix : c.dim(prix)}`);
}

/* ------------------------------------------------------------ 4. comptes */

const u = await get(`${URL_}/rest/v1/users?select=email,name,role,active,last_seen_at&order=created_at.asc`);
console.log(`\n${c.b("Comptes du back-office")}`);
if (!u.ok) {
  console.log(`  ${c.ko("✗")} Table « users » injoignable (${u.status})`);
} else if (!u.body.length) {
  console.log(`  ${c.ko("✗")} Aucun compte — personne ne peut entrer dans /admin.`);
  console.log(`  ${c.dim("→ node scripts/migrate.mjs --email=... --nom=\"...\"")}`);
} else {
  for (const acc of u.body) {
    const vu = acc.last_seen_at ? new Date(acc.last_seen_at).toLocaleDateString("fr-FR") : "jamais connecté";
    const etat = acc.active ? c.ok("actif".padEnd(10)) : c.ko("désactivé".padEnd(10));
    console.log(`  ${acc.email.padEnd(28)} ${acc.role.padEnd(11)} ${etat} ${c.dim(vu)}`);
  }
  if (!u.body.some((a) => a.role === "superadmin" && a.active)) {
    console.log(`  ${c.ko("✗")} Aucun superadmin actif — personne ne peut gérer les comptes.`);
  }
}

/* ---------------------------------------------------------- 5. verdict */

console.log();
if (v.body.length === 0) {
  console.log(`${c.warn("!")} La base est vide : la migration n'a pas encore tourné.`);
  console.log(`  ${c.dim("→ node scripts/migrate.mjs --email=... --nom=\"...\"")}`);
} else if (localesRestantes > 0) {
  console.log(`${c.warn("!")} ${localesRestantes} photo(s) pointent encore vers l'ancien dossier public/vehicules/.`);
  console.log(`  ${c.dim("→ relancer node scripts/migrate.mjs met tout à jour.")}`);
} else {
  console.log(`${c.ok("✓")} Tout est en place côté Supabase.`);
  console.log(`  ${c.dim("Si le site en ligne montre encore d'anciennes images, c'est que le déploiement")}`);
  console.log(`  ${c.dim("Vercel n'a pas les variables SUPABASE_URL / SERVICE_ROLE_KEY, ou n'est pas à jour.")}`);
}
console.log();
