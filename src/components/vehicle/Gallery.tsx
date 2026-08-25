"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { Lightbox } from "./Lightbox";

/**
 * Galerie de la fiche véhicule.
 *
 * Deux contraintes ont dicté la mise en page :
 *
 * 1. **Les photos arrivent en portrait comme en paysage** — un téléphone tenu
 *    verticalement pour l'intérieur, horizontalement pour la façade. Rogner
 *    couperait le toit ou les roues. La scène a donc une hauteur fixe et
 *    l'image est contenue dedans ; un fond flouté tiré de la photo elle-même
 *    remplit les côtés, ce qui donne une mise en scène au lieu d'un vide.
 * 2. **On doit pouvoir regarder de près.** Un acheteur à 10 millions inspecte
 *    les jantes et les bas de caisse. Un clic ouvre la visionneuse plein
 *    écran, avec zoom ancré et déplacement.
 */
export function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const strip = useRef<HTMLDivElement>(null);

  /**
   * Ratio réel de chaque photo, mesuré au chargement.
   *
   * Sans lui, impossible d'arrondir les angles de l'image : avec
   * `object-contain`, le cadre de l'élément occupe toute la scène et la photo
   * y flotte au milieu — un `border-radius` arrondirait le cadre, pas la
   * photo. On donne donc au conteneur le ratio exact du fichier, ce qui le
   * fait coïncider au pixel près avec l'image affichée.
   */
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const ratio = ratios[photos[i]] ?? 16 / 10;

  const go = (n: number) => {
    const next = (n + photos.length) % photos.length;
    setI(next);
    strip.current?.children[next]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  };

  return (
    /* min-w-0 : sans lui, la pellicule (≈700 px de vignettes) élargit la colonne
       de grille — la largeur minimale d'un élément de grille vaut « auto ». */
    <div className="min-w-0">
      <div
        className="stage relative rounded-[var(--r4)] border overflow-hidden
                   h-[clamp(320px,56vh,660px)]"
        style={{ borderColor: "var(--line)", boxShadow: "var(--sh-m)" }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
          if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
        }}
        tabIndex={photos.length > 1 ? 0 : -1}
        role={photos.length > 1 ? "group" : undefined}
        aria-label={
          photos.length > 1
            ? `${alt} — photo ${i + 1} sur ${photos.length}. Flèches gauche et droite pour naviguer.`
            : undefined
        }
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={photos[i]}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.19, 0.72, 0.3, 1] }}
          >
            {/* remplissage des marges : la photo elle-même, floutée et agrandie */}
            <Image
              src={photos[i]}
              alt=""
              aria-hidden
              fill
              sizes="10vw"
              className="object-cover scale-110 blur-2xl opacity-35 z-[1]"
            />
            <div className="absolute inset-0 z-[2] grid place-items-center p-2 sm:p-3">
              {/* Dimensions intrinsèques plutôt que `fill` : contrainte par
                  max-w/max-h, l'image se réduit en gardant son ratio, et le
                  cadre de l'élément coïncide exactement avec la photo — c'est
                  ce qui permet d'arrondir les angles de la photo elle-même,
                  sans jamais la rogner, portrait comme paysage.
                  min-h-0 / min-w-0 : un élément de grille a `min-height: auto`,
                  qui l'empêcherait de descendre sous sa taille intrinsèque —
                  la photo portrait déborderait de la scène au lieu de s'y
                  réduire. */}
              <Image
                src={photos[i]}
                alt={i === 0 ? alt : `${alt} — photo ${i + 1}`}
                width={1200}
                height={Math.round(1200 / ratio)}
                sizes="(max-width: 1024px) 100vw, 58vw"
                priority={i === 0}
                className="max-w-full max-h-full min-w-0 min-h-0 w-auto h-auto object-contain rounded-[var(--r2)]"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (!img.naturalWidth) return;
                  const r = img.naturalWidth / img.naturalHeight;
                  setRatios((prev) => (prev[photos[i]] === r ? prev : { ...prev, [photos[i]]: r }));
                }}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* toute la scène est cliquable : c'est la cible la plus évidente */}
        <button
          type="button"
          onClick={() => setZoom(true)}
          aria-label={`Agrandir la photo ${i + 1} de ${alt}`}
          className="absolute inset-0 z-[4] cursor-zoom-in"
        />

        <span
          className="absolute left-3 bottom-3 z-[5] pointer-events-none flex items-center gap-1.5
                     px-3 py-1.5 rounded-full text-[11.5px] backdrop-blur-md border"
          style={{ background: "var(--blur)", borderColor: "var(--line)", color: "var(--ink-2)" }}
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5M11 8.5v5M8.5 11h5" />
          </svg>
          Agrandir
        </span>

        {photos.length > 1 && (
          <>
            <Arrow side="left" onClick={() => go(i - 1)} />
            <Arrow side="right" onClick={() => go(i + 1)} />
            <span
              className="absolute bottom-3 right-3 z-[5] pointer-events-none px-2.5 py-1 rounded-full text-[11px] tnum backdrop-blur-md border"
              style={{ background: "var(--blur)", color: "var(--ink-2)", borderColor: "var(--line)" }}
            >
              {i + 1} / {photos.length}
            </span>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div ref={strip} className="flex gap-2.5 mt-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
          {photos.map((p, n) => (
            <button
              key={p}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Voir la photo ${n + 1} sur ${photos.length}`}
              aria-current={n === i}
              className="stage relative shrink-0 w-[104px] aspect-[16/10] rounded-[12px] overflow-hidden border transition-all duration-300 snap-start"
              style={{ borderColor: n === i ? "var(--brand)" : "var(--line)", opacity: n === i ? 1 : 0.6 }}
            >
              <Image src={p} alt="" fill sizes="104px" className="object-cover z-[2]" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {zoom && (
          <Lightbox photos={photos} index={i} alt={alt} onIndex={setI} onClose={() => setZoom(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/** Flèches toujours visibles : sur écran tactile, aucun survol ne viendrait les révéler. */
function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Photo précédente" : "Photo suivante"}
      className={`absolute top-1/2 -translate-y-1/2 z-[5] w-11 h-11 rounded-full grid place-items-center
                  backdrop-blur-md opacity-85 hover:opacity-100 transition-opacity duration-300
                  ${side === "left" ? "left-3" : "right-3"}`}
      style={{ background: "var(--blur)", border: "1px solid var(--line-2)", color: "var(--ink)" }}
    >
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"
           strokeLinecap="round" strokeLinejoin="round" aria-hidden
           style={{ transform: side === "right" ? "rotate(180deg)" : undefined }}>
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
