import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { sbDelete, sbSelect, sbUpdate, sbUpsert } from "./supabase";

/**
 * Comptes du back-office.
 *
 * Deux rôles, pas trois :
 *   · superadmin — gère le parc ET les comptes (c'est Mouhamed)
 *   · assistant  — gère le parc, et rien d'autre (c'est l'assistante au showroom)
 *
 * Pourquoi une table maison plutôt que Supabase Auth : la panne la plus probable
 * ici n'est pas une intrusion, c'est un mot de passe oublié un samedi matin.
 * Avec cette table, le superadmin réinitialise le mot de passe depuis le
 * back-office en cinq secondes. Avec Supabase Auth, il faudrait un service
 * d'envoi d'emails configuré, et attendre que le courriel arrive.
 */

const TABLE = "users";

export type Role = "superadmin" | "assistant";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  created_at: string;
  last_seen_at: string | null;
}

/** La même chose, plus l'empreinte — jamais renvoyée hors de ce fichier. */
type UserRow = User & { password_hash: string };

const PUBLIC_COLUMNS = "id,email,name,role,active,created_at,last_seen_at";

/** Retire l'empreinte du mot de passe avant que la ligne ne quitte ce fichier. */
const publicOf = (r: UserRow): User => ({
  id: r.id,
  email: r.email,
  name: r.name,
  role: r.role,
  active: r.active,
  created_at: r.created_at,
  last_seen_at: r.last_seen_at,
});

/* ---------------------------------------------------------- mots de passe */

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

/**
 * scrypt : lent et gourmand en mémoire par construction, donc coûteux à
 * attaquer en force brute — contrairement à un SHA-256 nu, qu'une carte
 * graphique parcourt par milliards par seconde. Il est fourni par Node, sans
 * dépendance à installer ni à maintenir.
 *
 * Le sel est tiré au hasard pour chaque compte : deux personnes qui choisissent
 * le même mot de passe n'ont pas la même empreinte, et une empreinte volée ne
 * peut pas être comparée à une table pré-calculée.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

async function passwordMatches(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, keyHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length);
  // Comparaison à durée constante : le temps de réponse ne révèle pas
  // combien de caractères de l'empreinte étaient corrects.
  return timingSafeEqual(expected, actual);
}

/** Règle unique, appliquée à la création comme à la réinitialisation. */
export function passwordProblem(password: string): string | null {
  if (password.length < 8) return "Le mot de passe doit faire au moins 8 caractères.";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Le mot de passe doit mélanger lettres et chiffres.";
  }
  return null;
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function emailProblem(email: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? null : "Adresse email invalide.";
}

/* ---------------------------------------------------------------- lecture */

export async function listUsers(): Promise<User[]> {
  return sbSelect<User>(TABLE, { select: PUBLIC_COLUMNS, order: "created_at.asc" });
}

export async function getUser(id: string): Promise<User | undefined> {
  const rows = await sbSelect<User>(TABLE, { select: PUBLIC_COLUMNS, id: `eq.${id}`, limit: 1 });
  return rows[0];
}

export async function countUsers(): Promise<number> {
  return (await sbSelect<{ id: string }>(TABLE, { select: "id" })).length;
}

/* -------------------------------------------------------------- connexion */

/**
 * Vérifie un couple email / mot de passe.
 *
 * Renvoie `null` dans les trois cas d'échec — compte inconnu, mot de passe
 * faux, compte désactivé — et l'appelant affiche un message unique. Distinguer
 * « cette adresse n'existe pas » de « mauvais mot de passe » indiquerait à un
 * inconnu quelles adresses sont valides.
 *
 * Le compte désactivé, lui, mérite d'être distingué : la personne concernée est
 * légitime, elle doit comprendre qu'il faut appeler le patron, pas retaper son
 * mot de passe dix fois.
 */
export async function authenticate(
  email: string,
  password: string,
): Promise<{ user: User } | { disabled: true } | null> {
  const rows = await sbSelect<UserRow>(TABLE, {
    select: `${PUBLIC_COLUMNS},password_hash`,
    email: `eq.${normalizeEmail(email)}`,
    limit: 1,
  });
  const row = rows[0];
  if (!row) return null;
  if (!(await passwordMatches(password, row.password_hash))) return null;
  if (!row.active) return { disabled: true };
  return { user: publicOf(row) };
}

/** Trace de dernière activité — affichée dans la liste des comptes. */
export async function touchLastSeen(id: string): Promise<void> {
  try {
    await sbUpdate(TABLE, { id: `eq.${id}` }, { last_seen_at: new Date().toISOString() });
  } catch {
    // Purement informatif : jamais de raison de faire échouer une navigation.
  }
}

/* --------------------------------------------------------------- écriture */

export async function createUser(input: {
  email: string;
  name: string;
  role: Role;
  password: string;
}): Promise<User> {
  const rows = await sbUpsert<User>(TABLE, {
    email: normalizeEmail(input.email),
    name: input.name.trim(),
    role: input.role,
    active: true,
    password_hash: await hashPassword(input.password),
  });
  return rows[0];
}

export async function updateUser(
  id: string,
  patch: Partial<{ name: string; role: Role; active: boolean }>,
): Promise<void> {
  await sbUpdate(TABLE, { id: `eq.${id}` }, patch);
}

export async function setPassword(id: string, password: string): Promise<void> {
  await sbUpdate(TABLE, { id: `eq.${id}` }, { password_hash: await hashPassword(password) });
}

export async function deleteUser(id: string): Promise<void> {
  await sbDelete(TABLE, { id: `eq.${id}` });
}
