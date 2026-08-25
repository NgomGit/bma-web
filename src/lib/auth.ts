import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUser, type User } from "./users";

/**
 * Session du back-office.
 *
 * Le cookie ne contient rien de confidentiel : l'identifiant du compte, une
 * date d'expiration, et une signature HMAC-SHA256 de ces deux valeurs. Modifier
 * l'un ou l'autre invalide la signature ; il est donc impossible de se
 * fabriquer une session, ou de se faire passer pour un autre compte, sans
 * connaître `AUTH_SECRET`.
 *
 * Le rôle, lui, n'est PAS dans le cookie — il est relu en base à chaque
 * requête. C'est ce qui permet à une désactivation ou à une rétrogradation de
 * prendre effet immédiatement, y compris pour quelqu'un déjà connecté. Un rôle
 * gravé dans le cookie resterait valable sept jours, ce qui viderait de son
 * sens le bouton « Désactiver ».
 */

export const COOKIE = "bma_session";
const DAYS = 7;
export const SESSION_MAX_AGE = DAYS * 24 * 60 * 60;

const secret = () => process.env.AUTH_SECRET ?? "";

async function key() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

const toHex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

const sign = async (payload: string) =>
  toHex(await crypto.subtle.sign("HMAC", await key(), new TextEncoder().encode(payload)));

export async function createToken(userId: string): Promise<string> {
  const payload = `${userId}.${Date.now() + DAYS * 864e5}`;
  return `${payload}.${await sign(payload)}`;
}

/** Renvoie l'identifiant du compte, ou `null` si le jeton est absent, périmé ou falsifié. */
async function readToken(token: string | undefined): Promise<string | null> {
  if (!token || !secret()) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  if (!userId || Number(exp) < Date.now()) return null;
  return (await sign(`${userId}.${exp}`)) === sig ? userId : null;
}

/**
 * Le compte connecté, ou `null`.
 *
 * `cache()` mémorise le résultat pour la durée d'une requête : une page qui
 * demande la session dans sa mise en page puis dans son contenu ne provoque
 * qu'un seul aller-retour vers la base.
 */
export const currentUser = cache(async (): Promise<User | null> => {
  const userId = await readToken((await cookies()).get(COOKIE)?.value);
  if (!userId) return null;
  try {
    const user = await getUser(userId);
    // Compte supprimé ou désactivé depuis la connexion : la session ne vaut plus rien.
    return user?.active ? user : null;
  } catch {
    // Base injoignable : on préfère déconnecter que laisser passer sans vérifier.
    return null;
  }
});

export async function isSignedIn(): Promise<boolean> {
  return (await currentUser()) !== null;
}

/** Garde de page ou d'action : renvoie le compte, ou redirige vers la connexion. */
export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/**
 * Garde des pages réservées au superadmin.
 *
 * Elle renvoie vers l'accueil du back-office plutôt que vers une page « accès
 * refusé » : une assistante qui suit un lien reçu par erreur n'a pas besoin
 * d'un avertissement, juste de se retrouver là où elle a quelque chose à faire.
 */
export async function requireSuperadmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "superadmin") redirect("/admin");
  return user;
}
