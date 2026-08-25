import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { requireSuperadmin } from "@/lib/auth";
import { readFlash } from "@/lib/flash";
import { listUsers, type User } from "@/lib/users";
import {
  createUserAction,
  deleteUserAction,
  resetUserPassword,
  setUserRole,
  toggleUserActive,
} from "@/app/admin/users-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Comptes" };

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

/** « Vu il y a 3 jours » plutôt qu'une date : ce qu'on cherche ici, c'est qui est actif. */
function ago(iso: string | null): string {
  if (!iso) return "Jamais connecté";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
  if (days === 0) return "Vu aujourd'hui";
  if (days === 1) return "Vu hier";
  if (days < 31) return `Vu il y a ${days} jours`;
  return `Vu le ${dateFmt.format(new Date(iso))}`;
}

export default async function UsersPage() {
  // `readFlash` remplace les paramètres d'URL : le mot de passe provisoire ne
  // doit apparaître ni dans l'historique du navigateur ni dans les journaux
  // d'accès de l'hébergeur. Voir src/lib/flash.ts.
  const [me, sp] = await Promise.all([requireSuperadmin(), readFlash()]);
  const users = await listUsers();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-[11px] font-medium tracking-[.2em] uppercase" style={{ color: "var(--brand)" }}>
            Accès au back-office
          </span>
          <h1 className="text-[28px] tracking-[-.035em] mt-1">
            {users.length} compte{users.length > 1 ? "s" : ""}
          </h1>
        </div>
      </div>

      {sp.err && (
        <p className="rounded-[10px] px-4 py-3 mb-5 text-[13.5px]" style={{ background: "rgba(229,72,77,.08)", color: "#E5484D" }}>
          {sp.err}
        </p>
      )}
      {sp.ok && !sp.mdp && (
        <p className="rounded-[10px] px-4 py-3 mb-5 text-[13.5px]" style={{ background: "rgba(47,187,116,.1)", color: "#2FBB74" }}>
          {sp.ok}
        </p>
      )}

      {/* Le mot de passe en clair, une seule fois. Il ne vit que dans un cookie
          d'une minute (src/lib/flash.ts) : passé ce délai, plus personne ne peut
          le relire — ni nous, ni la base, qui n'en garde qu'une empreinte. */}
      {sp.mdp && (
        <div
          className="rounded-[var(--r2)] border px-4 py-4 mb-5"
          style={{ borderColor: "#2FBB74", background: "rgba(47,187,116,.08)" }}
        >
          <b className="block text-[13.5px]" style={{ color: "#2FBB74" }}>{sp.ok}</b>
          <p className="text-[13px] mt-1.5 mb-2" style={{ color: "var(--ink-2)" }}>
            Mot de passe pour <b>{sp.pour}</b> — notez-le maintenant, il ne sera plus jamais affiché.
          </p>
          <code
            className="inline-block rounded-[8px] px-3 py-2 text-[16px] tracking-[.08em] select-all"
            style={{ background: "var(--surf-3)", border: "1px solid var(--line-2)" }}
          >
            {sp.mdp}
          </code>
        </div>
      )}

      {/* -------------------------------------------------------- la liste */}
      <div
        className="rounded-[var(--r2)] border overflow-hidden mb-9"
        style={{ borderColor: "var(--line)", background: "var(--surf)" }}
      >
        {users.map((u, i) => (
          <Row key={u.id} user={u} isMe={u.id === me.id} first={i === 0} />
        ))}
      </div>

      {/* ----------------------------------------------------- ajout de compte */}
      <h2 className="text-[19px] tracking-[-.03em] mb-1">Ajouter un compte</h2>
      <p className="text-[13px] mb-4" style={{ color: "var(--ink-2)" }}>
        Laissez le mot de passe vide pour en générer un : il s&apos;affichera une fois, à transmettre de vive voix.
      </p>

      <form
        action={createUserAction}
        className="rounded-[var(--r2)] border p-5 grid gap-4 sm:grid-cols-2 max-w-[720px]"
        style={{ borderColor: "var(--line)", background: "var(--surf)" }}
      >
        <Field label="Nom" name="name" placeholder="Awa Diop" required />
        <Field label="Email" name="email" type="email" placeholder="awa@bma.sn" required />
        <label className="block">
          <Legend>Rôle</Legend>
          <select name="role" defaultValue="assistant" className={INPUT} style={INPUT_STYLE}>
            <option value="assistant">Assistant — gère le parc</option>
            <option value="superadmin">Superadmin — gère le parc et les comptes</option>
          </select>
        </label>
        <Field label="Mot de passe" name="password" type="text" placeholder="généré si vide" autoComplete="new-password" />
        <div className="sm:col-span-2">
          <button type="submit" className="btn btn--primary btn--sm">Créer le compte</button>
        </div>
      </form>

      <div
        className="rounded-[var(--r2)] border px-4 py-3.5 mt-7 text-[12.5px] max-w-[720px]"
        style={{ borderColor: "var(--line-2)", background: "var(--surf-2)", color: "var(--ink-2)" }}
      >
        <b style={{ color: "var(--ink)" }}>Désactiver plutôt que supprimer.</b> Un compte désactivé ne peut plus
        entrer — la session en cours est coupée dès la page suivante — mais il reste dans la liste, et se
        réactive d&apos;un clic. La suppression, elle, est définitive.
      </div>
    </>
  );
}

/* ------------------------------------------------------------------- pièces */

function Row({ user: u, isMe, first }: { user: User; isMe: boolean; first: boolean }) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 md:px-5"
      style={{ borderTop: first ? undefined : "1px solid var(--line)", opacity: u.active ? 1 : 0.62 }}
    >
      <div className="min-w-0 flex-auto">
        <b className="block text-[15px] tracking-[-.02em]">
          {u.name}
          {isMe && <span className="ml-2 text-[11px] font-normal" style={{ color: "var(--ink-3)" }}>(vous)</span>}
        </b>
        <span className="block text-[12.5px] mt-0.5 truncate" style={{ color: "var(--ink-2)" }}>{u.email}</span>
        <span className="block text-[11.5px] mt-1" style={{ color: "var(--ink-3)" }}>
          Créé le {dateFmt.format(new Date(u.created_at))} · {ago(u.last_seen_at)}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Badge
          label={u.role === "superadmin" ? "Superadmin" : "Assistant"}
          color={u.role === "superadmin" ? "var(--brand)" : "var(--ink-2)"}
        />
        {!u.active && <Badge label="Désactivé" color="#E5484D" />}
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {/* Ces trois gestes n'ont aucun sens sur son propre compte : on ne les
            affiche pas plutôt que de les refuser après coup. */}
        {!isMe && (
          <form action={setUserRole}>
            <input type="hidden" name="id" value={u.id} />
            <input type="hidden" name="role" value={u.role === "superadmin" ? "assistant" : "superadmin"} />
            <button type="submit" className="btn btn--ghost btn--sm">
              {u.role === "superadmin" ? "Passer assistant" : "Passer superadmin"}
            </button>
          </form>
        )}

        <form action={resetUserPassword}>
          <input type="hidden" name="id" value={u.id} />
          <button type="submit" className="btn btn--ghost btn--sm">Nouveau mot de passe</button>
        </form>

        {!isMe && (
          <>
            <form action={toggleUserActive}>
              <input type="hidden" name="id" value={u.id} />
              <button type="submit" className="btn btn--ghost btn--sm">
                {u.active ? "Désactiver" : "Réactiver"}
              </button>
            </form>
            <form action={deleteUserAction}>
              <input type="hidden" name="id" value={u.id} />
              <ConfirmButton confirmLabel="Supprimer définitivement ?">Supprimer</ConfirmButton>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-[10.5px] font-medium tracking-[.1em] uppercase px-2.5 py-1 rounded-full border whitespace-nowrap"
      style={{ color, borderColor: "var(--line-2)", background: "var(--surf-2)" }}
    >
      {label}
    </span>
  );
}

const INPUT =
  "w-full rounded-[10px] border px-3.5 py-2.5 text-[14px] outline-none focus:border-[var(--brand)]";
const INPUT_STYLE = { background: "var(--surf-2)", borderColor: "var(--line-2)", color: "var(--ink)" };

function Legend({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[11px] font-medium tracking-[.1em] uppercase mb-1.5" style={{ color: "var(--ink-3)" }}>
      {children}
    </span>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <Legend>{label}</Legend>
      <input {...props} className={INPUT} style={INPUT_STYLE} />
    </label>
  );
}
