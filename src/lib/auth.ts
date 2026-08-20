import "server-only";
import { cookies } from "next/headers";

/**
 * Authentification du back-office.
 *
 * Un seul concessionnaire, un seul mot de passe : pas de table utilisateurs,
 * pas de dépendance externe. Le jeton est une date d'expiration signée en
 * HMAC-SHA256, déposée dans un cookie httpOnly.
 */

export const COOKIE = "bma_session";
const DAYS = 7;

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

export async function createToken(): Promise<string> {
  const exp = String(Date.now() + DAYS * 864e5);
  const sig = await crypto.subtle.sign("HMAC", await key(), new TextEncoder().encode(exp));
  return `${exp}.${toHex(sig)}`;
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token || !secret()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  const expected = await crypto.subtle.sign("HMAC", await key(), new TextEncoder().encode(exp));
  return toHex(expected) === sig;
}

/** Comparaison à durée constante — le temps de réponse ne révèle rien */
export function passwordMatches(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || candidate.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= candidate.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export async function isSignedIn(): Promise<boolean> {
  return verifyToken((await cookies()).get(COOKIE)?.value);
}

export const SESSION_MAX_AGE = DAYS * 24 * 60 * 60;
