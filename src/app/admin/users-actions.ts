"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { requireSuperadmin, requireUser } from "@/lib/auth";
import { setFlash, type Flash } from "@/lib/flash";
import {
  authenticate,
  createUser,
  deleteUser,
  emailProblem,
  getUser,
  passwordProblem,
  setPassword,
  updateUser,
  type Role,
} from "@/lib/users";

/**
 * Gestion des comptes — réservée au superadmin.
 *
 * Chaque action commence par `requireSuperadmin()`. La page est déjà protégée,
 * mais une action serveur est une URL comme une autre : elle peut être appelée
 * directement, sans passer par la page. La garde doit donc vivre ici aussi, pas
 * seulement à l'affichage.
 */

const PAGE = "/admin/utilisateurs";

/** Dépose le message puis renvoie sur la page — l'URL reste propre. */
async function back(flash: Flash): Promise<never> {
  await setFlash(flash);
  redirect(PAGE);
}

/**
 * Mot de passe provisoire : lisible au téléphone, assez long pour être sûr.
 *
 * L'alphabet exclut O/0 et I/l : ces caractères se confondent quand on dicte un
 * mot de passe au téléphone. On écarte aussi les tirages sans aucun chiffre —
 * ils échoueraient à la règle « lettres ET chiffres » imposée par ailleurs, et
 * sur douze caractères cela arrive une fois sur neuf.
 */
function generatePassword(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (;;) {
    const candidate = [...randomBytes(12)].map((b) => alphabet[b % alphabet.length]).join("");
    if (!passwordProblem(candidate)) return candidate;
  }
}

/* ---------------------------------------------------------------- création */

export async function createUserAction(formData: FormData) {
  await requireSuperadmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const role = (String(formData.get("role") ?? "assistant") as Role) === "superadmin" ? "superadmin" : "assistant";
  const typed = String(formData.get("password") ?? "");

  if (!name) return await back({ err: "Le nom est obligatoire." });

  const emailIssue = emailProblem(email);
  if (emailIssue) return await back({ err: emailIssue });

  // Champ laissé vide : on tire un mot de passe et on l'affiche une fois, pour
  // que le superadmin puisse le transmettre de vive voix.
  const generated = typed ? "" : generatePassword();
  const password = typed || generated;

  const passwordIssue = passwordProblem(password);
  if (passwordIssue) return await back({ err: passwordIssue });

  try {
    await createUser({ name, email, role, password });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Création impossible.";
    return await back({
      err: /duplicate key|unique/i.test(message)
        ? `Un compte existe déjà pour ${email.toLowerCase()}.`
        : message,
    });
  }

  return await back(
    generated
      ? { ok: `Compte créé pour ${name}.`, mdp: generated, pour: email.toLowerCase() }
      : { ok: `Compte créé pour ${name}.` },
  );
}

/* ------------------------------------------------------------ modifications */

/**
 * Active ou désactive un compte.
 *
 * Se désactiver soi-même est refusé : la page se rechargerait sans session et
 * il faudrait ouvrir la base à la main pour revenir. La base refuse par ailleurs
 * de laisser le parc sans aucun superadmin actif (voir supabase/schema.sql).
 */
export async function toggleUserActive(formData: FormData) {
  const me = await requireSuperadmin();
  const id = String(formData.get("id") ?? "");
  if (id === me.id) return await back({ err: "Vous ne pouvez pas désactiver votre propre compte." });

  const user = await getUser(id);
  if (!user) return await back({ err: "Compte introuvable." });

  try {
    await updateUser(id, { active: !user.active });
  } catch (e) {
    return await back({ err: e instanceof Error ? e.message : "Modification impossible." });
  }
  return await back({ ok: user.active ? `${user.name} n'a plus accès.` : `${user.name} a de nouveau accès.` });
}

export async function setUserRole(formData: FormData) {
  const me = await requireSuperadmin();
  const id = String(formData.get("id") ?? "");
  const role: Role = String(formData.get("role")) === "superadmin" ? "superadmin" : "assistant";
  if (id === me.id) return await back({ err: "Vous ne pouvez pas changer votre propre rôle." });

  const user = await getUser(id);
  if (!user) return await back({ err: "Compte introuvable." });

  try {
    await updateUser(id, { role });
  } catch (e) {
    return await back({ err: e instanceof Error ? e.message : "Modification impossible." });
  }
  return await back({
    ok: role === "superadmin" ? `${user.name} est maintenant superadmin.` : `${user.name} est maintenant assistant.`,
  });
}

/**
 * Réinitialise un mot de passe.
 *
 * Le nouveau mot de passe s'affiche une seule fois, en clair : c'est ce que le
 * superadmin va dicter au téléphone. Il n'est stocké nulle part ailleurs que
 * sous forme d'empreinte — le retrouver plus tard est impossible, il faudra en
 * générer un autre.
 */
export async function resetUserPassword(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "");
  const user = await getUser(id);
  if (!user) return await back({ err: "Compte introuvable." });

  const password = generatePassword();
  try {
    await setPassword(id, password);
  } catch (e) {
    return await back({ err: e instanceof Error ? e.message : "Réinitialisation impossible." });
  }
  return await back({ ok: `Nouveau mot de passe pour ${user.name}.`, mdp: password, pour: user.email });
}

export async function deleteUserAction(formData: FormData) {
  const me = await requireSuperadmin();
  const id = String(formData.get("id") ?? "");
  if (id === me.id) return await back({ err: "Vous ne pouvez pas supprimer votre propre compte." });

  const user = await getUser(id);
  if (!user) return await back({ err: "Compte introuvable." });

  try {
    await deleteUser(id);
  } catch (e) {
    return await back({ err: e instanceof Error ? e.message : "Suppression impossible." });
  }
  return await back({ ok: `Le compte de ${user.name} a été supprimé.` });
}

/* ------------------------------------------------- mon propre mot de passe */

/**
 * Changer son propre mot de passe — accessible à tous les comptes, celui-là.
 * Vit dans ce fichier par proximité de sujet, mais n'exige pas le superadmin.
 */
export async function changeOwnPassword(formData: FormData) {
  const me = await requireUser();

  const current = String(formData.get("actuel") ?? "");
  const next = String(formData.get("nouveau") ?? "");

  const fail = async (message: string): Promise<never> => {
    await setFlash({ err: message });
    redirect("/admin/mon-compte");
  };

  if (!(await authenticate(me.email, current))) return await fail("Mot de passe actuel incorrect.");
  const issue = passwordProblem(next);
  if (issue) return await fail(issue);

  await setPassword(me.id, next);
  await setFlash({ ok: "Mot de passe mis à jour." });
  redirect("/admin/mon-compte");
}
