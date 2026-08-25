"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Bouton à deux temps pour les gestes irréversibles.
 *
 * Un premier clic transforme le bouton en « Confirmer ? », un second exécute.
 * Préféré à `window.confirm()` : la boîte native du navigateur bloque toute la
 * page, s'affiche hors du style du site, et sur mobile apparaît collée en haut
 * de l'écran, loin du doigt. Ici la demande reste à l'endroit exact où le geste
 * a commencé.
 *
 * Le retour en arrière est automatique au bout de quelques secondes : un bouton
 * rouge « Confirmer ? » oublié dans un coin est une chausse-trappe.
 */
export function ConfirmButton({
  children,
  confirmLabel = "Confirmer ?",
  className = "btn btn--sm",
  danger = true,
}: {
  children: React.ReactNode;
  confirmLabel?: string;
  className?: string;
  danger?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const style = danger
    ? { border: "1px solid #E5484D", color: armed ? "#fff" : "#E5484D", background: armed ? "#E5484D" : undefined }
    : undefined;

  return (
    <button
      type="submit"
      className={className}
      style={style}
      onClick={(e) => {
        if (armed) return; // deuxième clic : on laisse le formulaire partir
        e.preventDefault();
        setArmed(true);
        timer.current = setTimeout(() => setArmed(false), 4000);
      }}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}
