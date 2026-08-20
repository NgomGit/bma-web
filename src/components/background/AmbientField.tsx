"use client";

import { useEffect, useRef } from "react";

/**
 * Champ ambiant — l'arrière-plan de la maison.
 *
 * Parti pris : la grille NE BOUGE PAS.
 * Une grille qui s'anime en continu fatigue l'œil, consomme de la batterie sur
 * mobile et évoque le jeu vidéo, pas le showroom. Ici c'est la LUMIÈRE qui se
 * déplace sur une trame fixe — comme un néon qui balaie une carrosserie.
 *
 * Trois couches :
 *  1. la trame de plan technique, révélée uniquement autour du curseur
 *  2. les repères larges, fixes, à peine visibles
 *  3. le balayage de showroom, lent et espacé (toutes les 13 s)
 *
 * Coût : aucun canvas, aucun rAF permanent — deux variables CSS mises à jour
 * dans une frame d'animation, et l'animation s'arrête hors focus.
 */
export function AmbientField() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    let queued = false;

    const apply = () => {
      queued = false;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      el.style.setProperty("--hx", `${x}px`);
      el.style.setProperty("--hy", `${y}px`);
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.classList.add("ambient--live");
      if (!queued) {
        queued = true;
        raf = requestAnimationFrame(apply);
      }
    };

    const onLeave = () => el.classList.remove("ambient--live");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className="ambient" aria-hidden>
      <div className="ambient__ticks" />
      <div className="ambient__grid" />
      <div className="ambient__sweep" />
      <div className="ambient__halo" />
    </div>
  );
}
