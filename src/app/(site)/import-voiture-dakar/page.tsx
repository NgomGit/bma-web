import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd, breadcrumbLd, dealerLd, faqLd, graph, meta } from "@/lib/seo";
import { Phone, WhatsApp } from "@/components/ui/icons";
import { site, waImport } from "@/lib/site";

/**
 * Page de service dédiée à l'import.
 *
 * C'est la requête la plus rentable du secteur à Dakar : forte intention
 * d'achat, faible concurrence éditoriale. Elle mérite sa propre adresse plutôt
 * qu'une simple ancre sur la page d'accueil.
 */

const TITLE = "Importer une voiture au Sénégal | BMA Dakar";
const DESC =
  "BMA importe à Dakar le véhicule exact que vous cherchez : recherche à l'étranger, rapport d'inspection avant achat, transport, dédouanement et immatriculation. Délai moyen 45 jours, à partir de 10 000 000 FCFA.";

export const metadata: Metadata = meta({
  title: TITLE,
  description: DESC,
  path: "/import-voiture-dakar",
  keywords: [
    "importer une voiture au Sénégal", "import voiture Dakar", "importation véhicule Sénégal",
    "acheter voiture depuis Dubaï Sénégal", "commander voiture Japon Dakar",
    "dédouanement voiture Sénégal", "prix dédouanement voiture Dakar",
    "importateur automobile Dakar", "voiture sur commande Sénégal",
  ],
});

const STEPS = [
  { n: 1, t: "Vous décrivez le véhicule", d: "Marque, modèle, année, boîte, motorisation et budget. Un appel ou un message WhatsApp suffit — nous vous disons immédiatement si la recherche est réaliste dans votre enveloppe." },
  { n: 2, t: "Nous cherchons à l'étranger", d: "Nos correspondants au Japon, à Dubaï et en Europe identifient les véhicules correspondants. Vous recevez photos, kilométrage réel, historique d'entretien et rapport d'inspection avant tout engagement." },
  { n: 3, t: "Vous validez, nous achetons", d: "Vous choisissez le véhicule. L'acompte et le montant final sont fixés ensemble, transport et droits de douane inclus — aucun frais ne s'ajoute en cours de route." },
  { n: 4, t: "Livraison à Dakar, clés en main", d: "Nous gérons le fret maritime, le dédouanement au Port de Dakar, le quitus fiscal et l'immatriculation. Vous récupérez le véhicule prêt à rouler, dossier complet à votre nom." },
];

const FAQ = [
  { q: "Combien de temps prend l'importation d'une voiture au Sénégal ?",
    a: "Comptez en moyenne 45 jours entre la validation de votre commande et la remise des clés à Dakar, dédouanement inclus. Le délai varie de 40 jours depuis Dubaï à 60 jours depuis l'Europe selon les rotations maritimes et le modèle recherché." },
  { q: "Quels frais s'ajoutent au prix du véhicule ?",
    a: "Le montant que nous vous annonçons est complet : prix d'achat, fret maritime, droits de douane, quitus fiscal et immatriculation. Nous fixons ce total avec vous avant l'achat — aucun frais ne s'ajoute ensuite." },
  { q: "Puis-je voir le véhicule avant qu'il soit acheté ?",
    a: "Vous recevez les photos détaillées, le kilométrage réel, l'historique d'entretien et un rapport d'inspection réalisé sur place avant l'achat. Rien n'est engagé sans votre accord écrit." },
  { q: "Depuis quels pays importez-vous ?",
    a: "Principalement le Japon, les Émirats arabes unis (Dubaï), l'Allemagne, la France et le Royaume-Uni. Le pays d'origine dépend du modèle : les 4×4 japonais viennent souvent de Dubaï, les berlines premium d'Allemagne." },
  { q: "Que se passe-t-il si le véhicule ne correspond pas à l'annonce ?",
    a: "C'est précisément pourquoi nous faisons inspecter chaque véhicule avant achat et pourquoi nous engageons notre nom sur chaque dossier. En cas d'écart constaté à la livraison, nous en assumons la responsabilité." },
  { q: "Quel budget prévoir pour importer un véhicule à Dakar ?",
    a: "Nos dossiers d'import commencent à 10 000 000 FCFA tout compris, dédouanement et immatriculation inclus. En dessous, la qualité du véhicule ne justifie généralement pas les frais fixes de l'opération." },
];

export default function ImportPage() {
  const trail = [
    { name: "Accueil", path: "/" },
    { name: "Importer une voiture", path: "/import-voiture-dakar" },
  ];

  return (
    <article className="section" style={{ paddingTop: "calc(var(--nav) + 40px)" }}>
      <JsonLd
        data={graph(
          dealerLd(),
          breadcrumbLd(trail),
          faqLd(FAQ),
          {
            "@type": "Service",
            "@id": `${site.url}/import-voiture-dakar#service`,
            name: "Importation de véhicules à Dakar",
            serviceType: "Importation automobile",
            provider: { "@id": `${site.url}/#concessionnaire` },
            areaServed: { "@type": "Country", name: "Sénégal" },
            description: DESC,
            offers: {
              "@type": "Offer",
              priceCurrency: "XOF",
              priceSpecification: {
                "@type": "PriceSpecification",
                minPrice: 10000000,
                priceCurrency: "XOF",
                description: "Dossier d'import complet, dédouanement et immatriculation inclus",
              },
            },
          },
        )}
      />
      <div className="wrap">
        <Breadcrumbs trail={trail} />
        <span className="kicker">Service · Import sur commande</span>
        <h1 className="h2 mt-4 mb-4">Importer une voiture au Sénégal</h1>
        <p className="lead mb-3">
          Vous cherchez un modèle précis qu&apos;on ne trouve pas sur le marché dakarois ? {site.legalName}{" "}
          le fait venir pour vous depuis le Japon, Dubaï ou l&apos;Europe — recherche, inspection avant
          achat, fret, dédouanement au Port de Dakar et immatriculation compris.
        </p>
        <p className="lead mb-10">
          Délai moyen de <strong style={{ color: "var(--ink)", fontWeight: 500 }}>45 jours</strong>, dossiers
          à partir de <strong style={{ color: "var(--ink)", fontWeight: 500 }}>10 000 000 FCFA</strong> tout
          compris. Un seul interlocuteur du premier appel à la remise des clés.
        </p>

        <h2 className="text-[24px] tracking-[-.035em] mb-6">Comment se déroule une commande</h2>
        <ol className="grid gap-3.5 lg:grid-cols-2 list-none p-0 m-0 mb-12">
          {STEPS.map((s) => (
            <li key={s.n} className="card p-6 hover:!translate-y-0">
              <span
                className="w-[38px] h-[38px] rounded-full grid place-items-center font-bold text-[14px] mb-4 text-white"
                style={{ background: "var(--brand)", boxShadow: "var(--glow)" }}
              >
                {s.n}
              </span>
              <h3 className="text-[17px] mb-2.5 tracking-[-.025em]">{s.t}</h3>
              <p className="text-[13.5px]" style={{ color: "var(--ink-2)" }}>{s.d}</p>
            </li>
          ))}
        </ol>

        <h2 className="text-[24px] tracking-[-.035em] mb-6">Questions fréquentes sur l&apos;import</h2>
        <div className="grid gap-3 mb-12">
          {FAQ.map((f) => (
            <details key={f.q} className="card p-5 hover:!translate-y-0">
              <summary className="text-[15.5px] cursor-pointer" style={{ fontWeight: 400 }}>{f.q}</summary>
              <p className="text-[14px] mt-3" style={{ color: "var(--ink-2)" }}>{f.a}</p>
            </details>
          ))}
        </div>

        <div className="card p-7 hover:!translate-y-0">
          <h2 className="text-[21px] tracking-[-.03em] mb-3">Décrivez-nous le véhicule que vous cherchez</h2>
          <p className="lead mb-5">
            Marque, modèle, année, boîte et budget : nous vous répondons le jour même sur la faisabilité et
            le délai.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={waImport()} target="_blank" rel="noopener" className="btn btn--wa">
              <WhatsApp /> Décrire mon véhicule
            </a>
            <a href={`tel:${site.phone}`} className="btn btn--ghost">
              <Phone /> {site.phoneDisplay}
            </a>
            <Link href="/vehicules" className="btn btn--ghost">Voir le parc disponible</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
