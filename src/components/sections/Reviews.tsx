import { Reveal } from "@/components/ui/Reveal";
import { Star } from "@/components/ui/icons";

/** ⚠️ Témoignages à valider avec Baye Mor avant publication */
const REVIEWS = [
  { i: "MD", n: "Mamadou D.", c: "Import — Dakar Plateau",
    t: "J'ai commandé un Prado depuis Dubaï. Photos à chaque étape, délai respecté, et le véhicule était exactement comme annoncé. Le dédouanement, ils ont tout géré." },
  { i: "AF", n: "Aïssatou F.", c: "Achat sur parc — Almadies",
    t: "Ce que j'ai apprécié : on m'a laissé venir avec mon mécanicien, sans discuter. Il a tout regardé pendant une heure. C'est ça qui m'a décidé." },
  { i: "OS", n: "Ousmane S.", c: "Achat sur parc — Thiès",
    t: "Deux ans après l'achat, j'ai appelé pour une question sur la carte grise. On m'a répondu le jour même. C'est rare." },
];

export function Reviews() {
  return (
    <section className="section pt-0">
      <div className="wrap">
        <Reveal className="mb-9">
          <span className="kicker">Avis clients</span>
          <h2 className="h2 mt-4">Ils sont repartis<br />avec les clés</h2>
        </Reveal>
        <div className="grid gap-3.5 md:grid-cols-3 md:gap-4.5">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.n} delay={i} as="article" className="card flex flex-col p-7 px-6">
              <div className="flex flex-col h-full" style={{ padding: 0 }}>
                <span className="flex gap-1 mb-4" style={{ color: "#F4B740" }}>
                  {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="w-[15px] h-[15px]" />)}
                </span>
                <p className="text-[14.5px] leading-[1.72] mb-5" style={{ color: "var(--ink-2)" }}>« {r.t} »</p>
                <span className="flex items-center gap-3 mt-auto pt-4 border-t" style={{ borderColor: "var(--line)" }}>
                  <i className="not-italic w-10 h-10 rounded-full grid place-items-center shrink-0 font-bold text-[13px] text-white" style={{ background: "var(--brand)" }}>
                    {r.i}
                  </i>
                  <span>
                    <b className="block text-[13.5px] font-medium">{r.n}</b>
                    <small className="block text-[11.5px]" style={{ color: "var(--ink-3)" }}>{r.c}</small>
                  </span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
