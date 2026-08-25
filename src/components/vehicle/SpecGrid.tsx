import type { Vehicle } from "@/data/vehicles";
import { vehicleSpecs } from "@/data/vehicles";

/**
 * La fiche technique, en grille.
 *
 * Partagée par la fiche complète et par l'aperçu rapide : les deux affichaient
 * la même liste, écrite deux fois — et la première correction à la demande de
 * BMA n'avait été appliquée qu'à un seul des deux endroits.
 *
 * Les séparateurs sont obtenus par `gap-px` sur un fond de la couleur du trait :
 * chaque case pose son propre fond par-dessus, et il ne reste du fond que des
 * lignes d'un pixel. Économique, mais avec un défaut — si la dernière rangée
 * est incomplète, le fond réapparaît en un rectangle gris. D'où les cases de
 * remplissage ci-dessous : elles ne contiennent rien, elles bouchent le trou.
 *
 * Il en faut un compte différent selon la largeur (deux colonnes sur téléphone,
 * trois au-delà), et on ne peut pas connaître la largeur au rendu serveur : on
 * calcule les deux, et l'affichage n'en montre que la bonne.
 */
export function SpecGrid({ vehicle, className = "" }: { vehicle: Vehicle; className?: string }) {
  const specs = vehicleSpecs(vehicle);
  const combler = (colonnes: number) => (colonnes - (specs.length % colonnes)) % colonnes;

  return (
    <dl
      className={`grid grid-cols-2 sm:grid-cols-3 gap-px rounded-[var(--r2)] overflow-hidden border m-0 ${className}`}
      style={{ background: "var(--line)", borderColor: "var(--line)" }}
    >
      {specs.map(([k, val]) => (
        <div key={k} className="p-3.5" style={{ background: "var(--surf)" }}>
          <dt className="block text-[9.5px] tracking-[.15em] uppercase m-0" style={{ color: "var(--ink-3)" }}>
            {k}
          </dt>
          <dd className="block mt-1.5 text-[14px] font-medium m-0">{val}</dd>
        </div>
      ))}

      {Array.from({ length: combler(3) }, (_, i) => (
        <div key={`c3-${i}`} className="hidden sm:block p-3.5" style={{ background: "var(--surf)" }} aria-hidden />
      ))}
      {Array.from({ length: combler(2) }, (_, i) => (
        <div key={`c2-${i}`} className="block sm:hidden p-3.5" style={{ background: "var(--surf)" }} aria-hidden />
      ))}
    </dl>
  );
}
