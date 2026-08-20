import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/brand/Logo";
import { isSignedIn } from "@/lib/auth";
import { signOut } from "../actions";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isSignedIn())) redirect("/admin/login");

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{ background: "var(--blur)", borderColor: "var(--line)" }}
      >
        <div className="wrap flex items-center gap-4 h-[64px]">
          <Link href="/admin" className="flex items-center gap-2.5 mr-auto">
            <LogoMark className="w-9 h-9" />
            <span className="leading-none">
              <b className="block text-[14px] font-bold tracking-[.06em]">BMA</b>
              <i className="block not-italic text-[8px] font-medium tracking-[.28em] mt-0.5" style={{ color: "var(--brand)" }}>
                BACK-OFFICE
              </i>
            </span>
          </Link>
          <Link href="/" target="_blank" className="text-[13px] hidden sm:inline" style={{ color: "var(--ink-2)" }}>
            Voir le site ↗
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
