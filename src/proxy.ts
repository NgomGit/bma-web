import { NextResponse, type NextRequest } from "next/server";

const COOKIE = "bma_session";

/**
 * Garde du back-office. La vérification cryptographique complète a lieu dans le
 * layout admin ; ce filtre écarte simplement les requêtes sans cookie pour
 * éviter d'exécuter du rendu inutile.
 *
 * Le fichier s'appelle `proxy.ts` et non `middleware.ts` : Next 16 a renommé la
 * convention. L'ancien nom fonctionne encore mais avertit à chaque build.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!req.cookies.get(COOKIE)?.value) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("suite", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
