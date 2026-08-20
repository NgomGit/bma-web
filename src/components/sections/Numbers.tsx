import { Dial } from "@/components/ui/Dial";

/** Chiffres clés présentés comme des cadrans de tableau de bord */
export function Numbers() {
  return (
    <section className="section" style={{ paddingBlock: 66 }}>
      <div className="wrap">
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-[var(--r3)] overflow-hidden border"
          style={{ background: "var(--line)", borderColor: "var(--line)" }}
        >
          <Dial value={12} suffix="+" max={20} label="années d'activité à Dakar" />
          <Dial value={480} suffix="+" max={600} label="véhicules livrés" />
          <Dial value={45} suffix=" j" max={90} label="délai moyen d'import" />
          <Dial value={100} suffix="%" max={100} label="dossiers en règle" />
        </div>
      </div>
    </section>
  );
}
