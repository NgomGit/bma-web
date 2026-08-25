"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE, SESSION_MAX_AGE, createToken, requireUser } from "@/lib/auth";
import { authenticate, touchLastSeen } from "@/lib/users";
import { getVehicle, makeSlug, putVehicle, removeVehicle, setOrder } from "@/lib/store";
import { objectPathFromUrl, sbRemoveObject, sbUpload } from "@/lib/supabase";
import type { BodyType, Vehicle } from "@/data/vehicles";

export type FormState = { error?: string; ok?: string };

/**
 * Rafraîchit toutes les pages publiques qui affichent des véhicules.
 *
 * On invalide la mise en page racine plutôt qu'une liste de chemins : un même
 * véhicule apparaît sur l'accueil, le catalogue, sa fiche, la page de sa marque,
 * celle de sa carrosserie et le plan du site. Énumérer ces chemins était source
 * d'oublis — le catalogue, justement, n'était jamais rafraîchi.
 */
function refreshPublicPages(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/vehicules/${slug}`);
}

/** Toute action du parc est ouverte aux deux rôles : c'est le métier de l'assistante. */
const requireSession = requireUser;

/* ------------------------------------------------------------------ session */

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("suite") ?? "/admin");

  if (!process.env.AUTH_SECRET) {
    return { error: "AUTH_SECRET n'est pas défini. Voir .env.example." };
  }

  let result: Awaited<ReturnType<typeof authenticate>>;
  try {
    result = await authenticate(email, password);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Connexion impossible." };
  }

  if (result && "disabled" in result) {
    return { error: "Ce compte a été désactivé. Contactez l'administrateur." };
  }
  if (!result) {
    // Léger délai : décourage les tentatives répétées, et empêche de mesurer
    // au chronomètre si l'adresse existe.
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Email ou mot de passe incorrect." };
  }

  await touchLastSeen(result.user.id);

  (await cookies()).set(COOKIE, await createToken(result.user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
  redirect("/admin/login");
}

/* ----------------------------------------------------------------- véhicules */

const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export async function saveVehicle(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireSession();

  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const year = Number(formData.get("year"));
  const existingSlug = String(formData.get("slug") ?? "").trim();

  if (!brand || !model) return { error: "La marque et le modèle sont obligatoires." };
  if (!Number.isInteger(year) || year < 1980 || year > 2100) return { error: "Année invalide." };

  const slug = existingSlug || makeSlug(brand, model, year);

  // création : refuser un slug déjà pris
  if (!existingSlug && (await getVehicle(slug))) {
    return { error: `Un véhicule porte déjà l'identifiant « ${slug} ». Modifiez le modèle ou l'année.` };
  }

  const vehicle: Vehicle = {
    slug,
    brand,
    model,
    body: (String(formData.get("body")) as BodyType) || "suv",
    year,
    mileage: String(formData.get("mileage") ?? "").trim(),
    gearbox: String(formData.get("gearbox") ?? "").trim(),
    fuel: String(formData.get("fuel") ?? "").trim(),
    seats: Number(formData.get("seats")) || 5,
    engine: String(formData.get("engine") ?? "").trim(),
    power: String(formData.get("power") ?? "").trim(),
    color: String(formData.get("color") ?? "").trim(),
    drivetrain: String(formData.get("drivetrain") ?? "").trim(),
    bodywork: String(formData.get("bodywork") ?? "").trim(),
    origin: String(formData.get("origin") ?? "").trim(),
    swatches: lines(formData.get("swatches")),
    note: String(formData.get("note") ?? "").trim(),
    equipment: lines(formData.get("equipment")),
    featured: formData.get("featured") === "on",
    photos: lines(formData.get("photos")),
  };
  // un prix vide ou nul signifie « sur demande » : on ne stocke rien
  const price = Number(String(formData.get("price") ?? "").replace(/\D/g, ""));
  if (price > 0) vehicle.price = price;

  /**
   * Champs obligatoires — vérifiés ici, pas seulement dans le navigateur.
   *
   * L'attribut `required` d'un formulaire ne protège rien : il suffit de le
   * retirer depuis les outils du navigateur, et une action serveur est de toute
   * façon une URL qu'on peut appeler directement. Ce sont exactement les cases
   * de la fiche technique affichée sur le site : les laisser vides produit une
   * annonce à trous.
   *
   * La motorisation et la puissance n'y figurent pas : la première n'est plus
   * affichée, la seconde disparaît proprement de la grille si elle manque.
   */
  const OBLIGATOIRES: [keyof Vehicle, string][] = [
    ["mileage", "le kilométrage"],
    ["gearbox", "la boîte"],
    ["fuel", "le carburant"],
    ["color", "la couleur"],
    ["drivetrain", "la transmission"],
    ["bodywork", "le type de caisse"],
  ];
  const manquants = OBLIGATOIRES.filter(([champ]) => !String(vehicle[champ] ?? "").trim()).map(([, nom]) => nom);
  if (manquants.length) {
    const liste =
      manquants.length === 1
        ? manquants[0]
        : `${manquants.slice(0, -1).join(", ")} et ${manquants[manquants.length - 1]}`;
    return { error: `Il manque ${liste}. Ces informations apparaissent sur la fiche du véhicule.` };
  }
  if (!Number.isInteger(vehicle.seats) || vehicle.seats < 2 || vehicle.seats > 9) {
    return { error: "Le nombre de places doit être compris entre 2 et 9." };
  }

  if (!vehicle.swatches.length) vehicle.swatches = ["#8AD6FF", "#C8D3DE", "#1F2A36", "#7E6A55"];
  if (!vehicle.photos?.length) delete vehicle.photos;

  /**
   * L'écriture peut échouer pour une raison qui n'est pas la faute de
   * l'utilisateur : base injoignable, variables d'environnement absentes.
   * Sans ce filet, l'action lève, Next renvoie un 500 et le concessionnaire ne
   * voit qu'une page noire « A server error occurred » — impossible à
   * interpréter. On rend le message tel quel dans le formulaire.
   */
  try {
    await putVehicle(vehicle);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Enregistrement impossible." };
  }

  refreshPublicPages(slug);
  redirect(`/admin?enregistre=${encodeURIComponent(slug)}`);
}

export async function deleteVehicle(formData: FormData) {
  await requireSession();
  const slug = String(formData.get("slug") ?? "");

  // On récupère les photos AVANT de supprimer la ligne : après, plus personne
  // ne saurait quels fichiers du seau sont devenus orphelins.
  const v = await getVehicle(slug);
  await removeVehicle(slug);
  for (const photo of v?.photos ?? []) {
    const object = objectPathFromUrl(photo);
    if (object) await sbRemoveObject(object);
  }

  refreshPublicPages(slug);
  redirect("/admin?supprime=1");
}

export async function duplicateVehicle(formData: FormData) {
  await requireSession();
  const slug = String(formData.get("slug") ?? "");
  const source = await getVehicle(slug);
  if (!source) redirect("/admin");
  const copy: Vehicle = {
    ...source,
    slug: `${source.slug}-copie`,
    model: `${source.model} (copie)`,
    featured: false,
  };
  await putVehicle(copy);
  refreshPublicPages(copy.slug);
  redirect(`/admin/vehicules/${copy.slug}`);
}

export async function toggleFeatured(formData: FormData) {
  await requireSession();
  const slug = String(formData.get("slug") ?? "");
  const v = await getVehicle(slug);
  if (v) {
    await putVehicle({ ...v, featured: !v.featured });
    refreshPublicPages(slug);
  }
  redirect("/admin");
}

/**
 * Enregistre l'ordre complet du parc.
 *
 * Appelée par le glisser-déposer du back-office. Elle reçoit la liste entière
 * plutôt qu'un déplacement d'un cran : c'est plus robuste, et une seule écriture
 * suffit même après avoir déplacé un véhicule de dix rangs.
 */
export async function saveOrder(slugs: string[]): Promise<FormState> {
  await requireSession();
  if (!Array.isArray(slugs) || slugs.some((s) => typeof s !== "string")) {
    return { error: "Ordre invalide." };
  }
  await setOrder(slugs);
  refreshPublicPages();
  return { ok: "Ordre enregistré" };
}

/* -------------------------------------------------------------------- photos */

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Enregistre une photo dans le seau Supabase Storage et renvoie son URL.
 *
 * Auparavant le fichier était écrit dans /public/vehicules/<slug>/ : sur
 * Vercel, ce dossier est en lecture seule et l'envoi échouait systématiquement.
 * Storage accepte l'écriture depuis n'importe quel hébergeur, sert les photos
 * derrière son propre CDN, et ne perd rien au déploiement suivant.
 */
export async function uploadPhoto(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireSession();
  const slug = String(formData.get("slug") ?? "").trim();
  const file = formData.get("file");

  if (!slug) return { error: "Enregistrez d'abord le véhicule, puis ajoutez les photos." };
  if (!(file instanceof File) || file.size === 0) return { error: "Aucun fichier sélectionné." };
  if (!ALLOWED.has(file.type)) return { error: "Format accepté : JPG, PNG, WebP ou AVIF." };
  if (file.size > MAX_BYTES) return { error: "Fichier trop lourd (8 Mo maximum)." };

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/avif" ? "avif" : "jpg";
  // Horodatage en base 36 + hasard : deux photos envoyées dans la même seconde
  // depuis deux téléphones ne peuvent pas s'écraser l'une l'autre.
  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

  let url: string;
  try {
    url = await sbUpload(`${slug}/${name}`, await file.arrayBuffer(), file.type);
    const v = await getVehicle(slug);
    if (v) await putVehicle({ ...v, photos: [...(v.photos ?? []), url] });
  } catch (e) {
    return { error: e instanceof Error ? `Téléversement impossible : ${e.message}` : "Téléversement impossible." };
  }

  refreshPublicPages(slug);
  return { ok: url };
}

export async function removePhoto(formData: FormData) {
  await requireSession();
  const slug = String(formData.get("slug") ?? "");
  const photo = String(formData.get("photo") ?? "");
  const v = await getVehicle(slug);
  if (v) {
    await putVehicle({ ...v, photos: (v.photos ?? []).filter((p) => p !== photo) });
    // Le fichier part aussi du seau : sans ça, chaque photo remplacée resterait
    // facturée au stockage sans qu'aucune page n'y renvoie.
    const object = objectPathFromUrl(photo);
    if (object) await sbRemoveObject(object);
    refreshPublicPages(slug);
  }
  redirect(`/admin/vehicules/${slug}`);
}
