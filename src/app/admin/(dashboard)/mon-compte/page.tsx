import { requireUser } from "@/lib/auth";
import { readFlash } from "@/lib/flash";
import { changeOwnPassword } from "@/app/admin/users-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mon compte" };

/**
 * Changer son propre mot de passe.
 *
 * Ouvert à tous les rôles, superadmin comme assistant : le mot de passe reçu au
 * téléphone est provisoire par nature, et chacun doit pouvoir le remplacer sans
 * redemander quoi que ce soit à personne.
 */
export default async function MyAccountPage() {
  const [me, sp] = await Promise.all([requireUser(), readFlash()]);

  return (
    <div className="max-w-[520px]">
      <span className="text-[11px] font-medium tracking-[.2em] uppercase" style={{ color: "var(--brand)" }}>
        {me.role === "superadmin" ? "Superadmin" : "Assistant"}
      </span>
      <h1 className="text-[28px] tracking-[-.035em] mt-1">{me.name}</h1>
      <p className="text-[13.5px] mt-1 mb-7" style={{ color: "var(--ink-2)" }}>{me.email}</p>

      {sp.err && (
        <p className="rounded-[10px] px-4 py-3 mb-5 text-[13.5px]" style={{ background: "rgba(229,72,77,.08)", color: "#E5484D" }}>
          {sp.err}
        </p>
      )}
      {sp.ok && (
        <p className="rounded-[10px] px-4 py-3 mb-5 text-[13.5px]" style={{ background: "rgba(47,187,116,.1)", color: "#2FBB74" }}>
          {sp.ok}
        </p>
      )}

      <form
        action={changeOwnPassword}
        className="rounded-[var(--r2)] border p-5 grid gap-4"
        style={{ borderColor: "var(--line)", background: "var(--surf)" }}
      >
        <h2 className="text-[17px] tracking-[-.03em]">Changer mon mot de passe</h2>
        <Field label="Mot de passe actuel" name="actuel" autoComplete="current-password" required />
        <Field label="Nouveau mot de passe" name="nouveau" autoComplete="new-password" required />
        <p className="text-[12px] -mt-1" style={{ color: "var(--ink-3)" }}>
          Au moins 8 caractères, mêlant lettres et chiffres.
        </p>
        <div>
          <button type="submit" className="btn btn--primary btn--sm">Enregistrer</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium tracking-[.1em] uppercase mb-1.5" style={{ color: "var(--ink-3)" }}>
        {label}
      </span>
      <input
        {...props}
        type="password"
        className="w-full rounded-[10px] border px-3.5 py-2.5 text-[14px] outline-none focus:border-[var(--brand)]"
        style={{ background: "var(--surf-2)", borderColor: "var(--line-2)", color: "var(--ink)" }}
      />
    </label>
  );
}
