"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE, SESSION_MAX_AGE, createToken, isSignedIn, passwordMatches } from "@/lib/auth";
import { getVehicle, makeSlug, putVehicle, removeVehicle, setOrder } from "@/lib/store";
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

async function requireSession() {
  if (!(await isSignedIn())) redirect("/admin/login");
}

/* ------------------------------------------------------------------ session */

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("suite") ?? "/admin");

  if (!process.env.ADMIN_PASSWORD || !process.env.AUTH_SECRET) {
    return { error: "ADMIN_PASSWORD et AUTH_SECRET ne sont pas définis. Voir .env.example." };
  }
  if (!passwordMatches(password)) {
    // léger délai : décourage les tentatives répétées
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Mot de passe incorrect." };
  }

  (await cookies()).set(COOKIE, await createToken(), {
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

  if (!vehicle.swatches.length) vehicle.swatches = ["#8AD6FF", "#C8D3DE", "#1F2A36", "#7E6A55"];
  if (!vehicle.photos?.length) delete vehicle.photos;

  /**
   * L'écriture peut échouer pour une raison qui n'est pas la faute de
   * l'utilisateur : disque en lecture seule sur un hébergement serverless.
   * Sans ce filet, l'action lève, Next renvoie un 500 et le concessionnaire
   * ne voit qu'une page noire « A server error occurred » — impossible à
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
  await removeVehicle(slug);
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
 * Enregistre une photo dans /public/vehicules/<slug>/ et renvoie son chemin.
 * ⚠️ Comme le store JSON, l'upload écrit sur le disque : hébergement Node
 * persistant requis. Sur serverless, brancher un service d'objets (S3, R2…).
 */
export async function uploadPhoto(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireSession();
  const slug = String(formData.get("slug") ?? "").trim();
  const file = formData.get("file");

  if (!slug) return { error: "Enregistrez d'abord le véhicule, puis ajoutez les photos." };
  if (!(file instanceof File) || file.size === 0) return { error: "Aucun fichier sélectionné." };
  if (!ALLOWED.has(file.type)) return { error: "Format accepté : JPG, PNG, WebP ou AVIF." };
  if (file.size > MAX_BYTES) return { error: "Fichier trop lourd (8 Mo maximum)." };

  const dir = path.join(process.cwd(), "public", "vehicules", slug);
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/avif" ? "avif" : "jpg";
  const name = `${Date.now().toString(36)}.${ext}`;
  const publicPath = `/vehicules/${slug}/${name}`;

  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    const v = await getVehicle(slug);
    if (v) await putVehicle({ ...v, photos: [...(v.photos ?? []), publicPath] });
  } catch {
    return {
      error:
        "Téléversement impossible : le système de fichiers est en lecture seule. " +
        "C'est le cas sur Vercel et Netlify. Déployez sur un hébergement Node persistant " +
        "(Render, Railway, VPS) pour que le back-office puisse écrire.",
    };
  }

  refreshPublicPages(slug);
  return { ok: publicPath };
}

export async function removePhoto(formData: FormData) {
  await requireSession();
  const slug = String(formData.get("slug") ?? "");
  const photo = String(formData.get("photo") ?? "");
  const v = await getVehicle(slug);
  if (v) {
    await putVehicle({ ...v, photos: (v.photos ?? []).filter((p) => p !== photo) });
    refreshPublicPages(slug);
  }
  redirect(`/admin/vehicules/${slug}`);
}
