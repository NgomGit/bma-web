import { Reveal } from "@/components/ui/Reveal";
import { Doc, Key, Search, User } from "@/components/ui/icons";

const ITEMS = [
  { icon: <Search />, t: "Contrôle avant mise en vente", d: "Moteur, boîte, châssis, électronique. Chaque véhicule est contrôlé avant d'entrer dans le parc." },
  { icon: <Doc />, t: "Papiers vérifiés et complets", d: "Carte grise, quitus fiscal, dédouanement. Rien ne sort d'ici sans un dossier propre à votre nom." },
  { icon: <Key />, t: "Essai libre avant décision", d: "Vous conduisez, vous faites venir votre mécanicien, vous prenez le temps. Sans pression." },
  { icon: <User />, t: "Un nom, une personne", d: "Baye Mor met son nom sur chaque vente. Après la livraison, vous avez toujours le même numéro." },
];

export function Guarantees() {
  return (
    <section className="section pt-0" id="garanties">
      <div className="wrap">
        <Reveal className="mb-9">
          <span className="kicker">04 — Garanties</span>
          <h2 className="h2 mt-4">Ce qu&apos;on met en face<br />de votre engagement</h2>
          <p className="lead mt-3.5">
            Un véhicule à plusieurs millions ne s&apos;achète pas sur une photo. Voici les quatre règles que la maison
            s&apos;impose.
          </p>
        </Reveal>
        <div className="grid gap-3.5 md:grid-cols-2 md:gap-4.5 xl:grid-cols-4">
          {ITEMS.map((it, i) => (
            <Reveal key={it.t} delay={i} as="article" className="card p-7 px-6" >
              <div className="p-7 px-6" style={{ padding: 0 }}>
                <span
                  className="w-[46px] h-[46px] rounded-[14px] grid place-items-center border mb-4.5 text-[20px]"
                  style={{ background: "var(--surf-3)", borderColor: "var(--line)", color: "var(--brand)", marginBottom: 18 }}
                >
                  {it.icon}
                </span>
                <h3 className="text-[17px] mb-2.5 tracking-[-.025em]">{it.t}</h3>
                <p className="text-[13.5px]" style={{ color: "var(--ink-2)" }}>{it.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
