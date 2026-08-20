import Link from "next/link";

export const metadata = { title: "Page introuvable | BMA Dakar", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="section" style={{ paddingTop: "calc(var(--nav) + 60px)" }}>
      <div className="wrap" style={{ maxWidth: 720 }}>
        <span className="kicker">Erreur 404</span>
        <h1 className="h2 mt-4 mb-4">Cette page n&apos;existe plus</h1>
        <p className="lead mb-8">
          Le véhicule a peut-être été vendu, ou l&apos;adresse a changé. Le parc à jour est juste ici.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/vehicules" className="btn btn--primary">Voir le parc disponible</Link>
          <Link href="/import-voiture-dakar" className="btn btn--ghost">Importer une voiture</Link>
          <Link href="/" className="btn btn--ghost">Accueil</Link>
        </div>
      </div>
    </section>
  );
}
