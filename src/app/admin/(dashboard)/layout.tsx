import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { requireUser } from "@/lib/auth";
import { signOut } from "../actions";

export const dynamic = "force-dynamic";

/**
 * Coquille du back-office.
 *
 * `requireUser()` fait ici le vrai travail de garde : il relit le compte en
 * base à chaque affichage. Un compte désactivé pendant qu'il naviguait se
 * retrouve donc à l'écran de connexion à la page suivante, sans attendre
 * l'expiration du cookie.
 *
 * L'onglet « Comptes » n'apparaît que pour le superadmin. Ce n'est pas la
 * sécurité — celle-ci vit dans `requireSuperadmin()`, côté serveur, page et
 * actions comprises — c'est de la clarté : on ne montre pas une porte fermée.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await requireUser();

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{ background: "var(--blur)", borderColor: "var(--line)" }}
      >
        <div className="wrap flex items-center gap-3 sm:gap-5 h-[64px]">
          <Link href="/admin" className="flex items-center gap-2.5">
            <LogoMark className="w-9 h-9" />
            <span className="leading-none hidden sm:block">
              <b className="block text-[14px] font-bold tracking-[.06em]">BMA</b>
              <i className="block not-italic text-[8px] font-medium tracking-[.28em] mt-0.5" style={{ color: "var(--brand)" }}>
                BACK-OFFICE
              </i>
            </span>
          </Link>

          <nav className="flex items-center gap-1 mr-auto">
            <Tab href="/admin">Parc</Tab>
            {me.role === "superadmin" && <Tab href="/admin/utilisateurs">Comptes</Tab>}
          </nav>

          <Link href="/" target="_blank" className="text-[13px] hidden md:inline" style={{ color: "var(--ink-2)" }}>
            Voir le site ↗
          </Link>

          <Link
            href="/admin/mon-compte"
            className="text-[13px] leading-tight hidden sm:block text-right"
            style={{ color: "var(--ink-2)" }}
          >
            {me.name}
            <span className="block text-[10px] tracking-[.14em] uppercase" style={{ color: "var(--ink-3)" }}>
              {me.role === "superadmin" ? "Superadmin" : "Assistant"}
            </span>
          </Link>

          <form action={signOut}>
            <button className="btn btn--ghost btn--sm" type="submit">Déconnexion</button>
          </form>
        </div>
      </header>
      <main className="wrap py-8 md:py-10">{children}</main>
    </>
  );
}

function Tab({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[13.5px] px-3 py-1.5 rounded-[9px] transition-colors duration-200 hover:bg-[var(--surf-2)]"
      style={{ color: "var(--ink-2)" }}
    >
      {children}
    </Link>
  );
}
