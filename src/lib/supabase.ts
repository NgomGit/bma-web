import "server-only";

/**
 * Accès à Supabase — client minimal, côté serveur uniquement.
 *
 * Pourquoi pas la bibliothèque officielle `@supabase/supabase-js` ?
 * Elle embarque le temps réel, l'authentification et le multi-onglets, dont ce
 * site n'utilise rien : le back-office est rendu sur le serveur, il n'y a pas de
 * session navigateur à rafraîchir. Supabase expose de toute façon deux API HTTP
 * ordinaires — PostgREST pour les tables, Storage pour les fichiers. Les
 * quelques lignes ci-dessous suffisent, ne pèsent rien au démarrage d'une
 * fonction serverless, et restent lisibles quand il faudra les relire dans un an.
 *
 * ⚠️ La clé utilisée est la clé `service_role` : elle contourne les règles de
 * sécurité de la base. Elle ne doit JAMAIS traverser le navigateur. C'est le
 * rôle du `import "server-only"` en tête de fichier : si un composant client
 * importe ce module, la compilation échoue au lieu de publier la clé.
 */

const URL_ = process.env.SUPABASE_URL ?? "";
// Les deux noms sont acceptés : `SUPABASE_SERVICE_ROLE_KEY` est la convention
// Supabase, `SERVICE_ROLE_KEY` est ce qui se trouve déjà dans le .env du projet.
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SERVICE_ROLE_KEY ?? "";

export const supabaseConfigured = Boolean(URL_ && KEY);

/** Message unique, pour ne pas avoir à le réécrire à chaque appelant. */
export const NOT_CONFIGURED =
  "Base de données non configurée : SUPABASE_URL et SERVICE_ROLE_KEY sont absents " +
  "des variables d'environnement. Voir .env.example.";

const headers = (extra?: Record<string, string>) => ({
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  ...extra,
});

/**
 * Traduit une réponse d'erreur Supabase en `Error` lisible.
 *
 * PostgREST renvoie un objet `{ message, details, hint, code }`. Le `message`
 * est souvent celui d'un `raise exception` écrit dans schema.sql — donc une
 * phrase en français destinée à l'utilisateur. On la remonte telle quelle
 * jusqu'au formulaire plutôt que d'afficher « erreur 500 ».
 */
async function fail(res: Response): Promise<never> {
  let message = `${res.status} ${res.statusText}`;
  try {
    const body = (await res.json()) as { message?: string; hint?: string };
    if (body?.message) message = body.hint ? `${body.message} (${body.hint})` : body.message;
  } catch {
    /* réponse vide ou non-JSON : on garde le code HTTP */
  }
  throw new Error(message);
}

/* ------------------------------------------------------------------- tables */

type Query = Record<string, string | number | undefined>;

const qs = (q?: Query) =>
  q
    ? "?" +
      Object.entries(q)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
        .join("&")
    : "";

/** Lecture. `select` suit la syntaxe PostgREST : `*`, `id,email`, … */
export async function sbSelect<T>(table: string, query?: Query): Promise<T[]> {
  if (!supabaseConfigured) throw new Error(NOT_CONFIGURED);
  const res = await fetch(`${URL_}/rest/v1/${table}${qs({ select: "*", ...query })}`, {
    headers: headers(),
    // Le parc change dès qu'une voiture est enregistrée : jamais de cache HTTP.
    // La mise en cache utile est celle des pages, gérée par `revalidatePath`.
    cache: "no-store",
  });
  if (!res.ok) await fail(res);
  return (await res.json()) as T[];
}

/**
 * Écriture. `onConflict` déclenche un « insérer ou mettre à jour » : c'est ce
 * qui permet à `putVehicle` d'être la même fonction pour une création et pour
 * une modification, comme avant avec le fichier JSON.
 */
export async function sbUpsert<T>(
  table: string,
  rows: unknown,
  opts: { onConflict?: string; returning?: boolean } = {},
): Promise<T[]> {
  if (!supabaseConfigured) throw new Error(NOT_CONFIGURED);
  const prefer = [
    opts.onConflict ? "resolution=merge-duplicates" : null,
    opts.returning === false ? "return=minimal" : "return=representation",
  ]
    .filter(Boolean)
    .join(",");

  const res = await fetch(`${URL_}/rest/v1/${table}${qs({ on_conflict: opts.onConflict })}`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json", Prefer: prefer }),
    body: JSON.stringify(rows),
    cache: "no-store",
  });
  if (!res.ok) await fail(res);
  return opts.returning === false ? [] : ((await res.json()) as T[]);
}

/** Mise à jour partielle des lignes filtrées par `match`. */
export async function sbUpdate<T>(table: string, match: Query, patch: unknown): Promise<T[]> {
  if (!supabaseConfigured) throw new Error(NOT_CONFIGURED);
  const res = await fetch(`${URL_}/rest/v1/${table}${qs(match)}`, {
    method: "PATCH",
    headers: headers({ "Content-Type": "application/json", Prefer: "return=representation" }),
    body: JSON.stringify(patch),
    cache: "no-store",
  });
  if (!res.ok) await fail(res);
  return (await res.json()) as T[];
}

export async function sbDelete(table: string, match: Query): Promise<void> {
  if (!supabaseConfigured) throw new Error(NOT_CONFIGURED);
  const res = await fetch(`${URL_}/rest/v1/${table}${qs(match)}`, {
    method: "DELETE",
    headers: headers({ Prefer: "return=minimal" }),
    cache: "no-store",
  });
  if (!res.ok) await fail(res);
}

/* ------------------------------------------------------------------ fichiers */

export const BUCKET = "vehicules";

/** URL publique d'une photo. Le seau est en lecture publique : pas de signature. */
export const photoUrl = (objectPath: string) =>
  `${URL_}/storage/v1/object/public/${BUCKET}/${objectPath}`;

/** Hôte du projet, pour l'autoriser dans next.config.ts. */
export const supabaseHost = URL_ ? new URL(URL_).host : "";

export async function sbUpload(objectPath: string, body: ArrayBuffer, contentType: string) {
  if (!supabaseConfigured) throw new Error(NOT_CONFIGURED);
  const res = await fetch(`${URL_}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: "POST",
    headers: headers({ "Content-Type": contentType, "x-upsert": "true", "cache-control": "31536000" }),
    body,
    cache: "no-store",
  });
  if (!res.ok) await fail(res);
  return photoUrl(objectPath);
}

export async function sbRemoveObject(objectPath: string) {
  if (!supabaseConfigured) throw new Error(NOT_CONFIGURED);
  const res = await fetch(`${URL_}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: "DELETE",
    headers: headers(),
    cache: "no-store",
  });
  // 404 : le fichier n'existe plus. L'objectif — qu'il ne soit plus là — est
  // atteint, inutile de faire échouer la suppression du véhicule pour ça.
  if (!res.ok && res.status !== 404) await fail(res);
}

/**
 * Retrouve le chemin dans le seau à partir de l'URL publique stockée en base.
 * Renvoie `null` pour les chemins hérités du disque (« /vehicules/... »), qui
 * ne sont pas des objets Storage et n'ont donc rien à y supprimer.
 */
export function objectPathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}
