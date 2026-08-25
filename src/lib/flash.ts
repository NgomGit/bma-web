import "server-only";
import { cookies } from "next/headers";

/**
 * Message d'un écran à l'autre, après une action serveur.
 *
 * Pourquoi pas `?ok=...` dans l'URL, comme ailleurs dans le back-office : parce
 * que ces messages-là transportent parfois un mot de passe provisoire. Une URL
 * finit dans l'historique du navigateur, dans le presse-papier quand on partage
 * le lien, et dans les journaux d'accès de l'hébergeur — trois endroits où un
 * mot de passe n'a rien à faire.
 *
 * Un cookie httpOnly de courte durée ne va nulle part de tout cela. Il expire
 * seul au bout d'une minute : le temps de lire et de noter, pas davantage.
 */

const NAME = "bma_flash";
const TTL = 60;

export type Flash = { ok?: string; err?: string; mdp?: string; pour?: string };

export async function setFlash(flash: Flash): Promise<void> {
  (await cookies()).set(NAME, JSON.stringify(flash), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: TTL,
  });
}

export async function readFlash(): Promise<Flash> {
  const raw = (await cookies()).get(NAME)?.value;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Flash;
  } catch {
    return {};
  }
}
