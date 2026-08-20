"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { Close } from "@/components/ui/icons";

/**
 * Visionneuse plein écran, avec zoom et déplacement.
 *
 * Le zoom est ancré : le point sous le curseur — ou entre les deux doigts —
 * ne bouge pas pendant l'agrandissement. C'est ce qui sépare un vrai zoom d'un
 * agrandissement au centre : sur une voiture on zoome sur une jante ou un bas
 * de caisse, jamais sur le milieu de la photo.
 *
 * Les photos du parc font au mieux 1400 px de large. Au-delà de 3× on ne
 * révèle plus aucun détail, on étire des pixels : le facteur est donc plafonné
 * à 4, pas à 10.
 *
 * Fermeture : croix, Échap. Le clic dans la zone d'image est réservé au zoom —
 * un clic qui ferme parfois et zoome parfois serait imprévisible.
 */

const MIN = 1;
const MAX = 4;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type View = { s: number; x: number; y: number };
const RESET: View = { s: 1, x: 0, y: 0 };

export function Lightbox({
  photos,
  index,
  alt,
  onClose,
  onIndex,
}: {
  photos: string[];
  index: number;
  alt: string;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const [view, setView] = useState<View>(RESET);
  const [dragging, setDragging] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  // miroir synchrone de l'état : lisible depuis les gestionnaires natifs
  const viewRef = useRef(view);
  viewRef.current = view;

  /** pointeurs actifs — deux à la fois = pincement */
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; s: number } | null>(null);
  /**
   * Un glissement se termine par un événement `click` du navigateur. Sans ce
   * témoin, déplacer l'image puis relâcher réinitialiserait le zoom qu'on
   * venait juste de régler.
   */
  const moved = useRef(false);

  const go = useCallback(
    (n: number) => {
      onIndex((n + photos.length) % photos.length);
      setView(RESET);
    },
    [onIndex, photos.length],
  );

  /** Zoom ancré sur un point écran : ce point reste immobile. */
  const zoomAt = useCallback((clientX: number, clientY: number, next: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const dx = clientX - (r.left + r.width / 2);
    const dy = clientY - (r.top + r.height / 2);
    setView((v) => {
      const s = clamp(next, MIN, MAX);
      if (s === MIN) return RESET;
      // coordonnée image sous le curseur — invariante avant/après
      const ux = (dx - v.x) / v.s;
      const uy = (dy - v.y) / v.s;
      const lx = (r.width * (s - 1)) / 2;
      const ly = (r.height * (s - 1)) / 2;
      return { s, x: clamp(dx - s * ux, -lx, lx), y: clamp(dy - s * uy, -ly, ly) };
    });
  }, []);

  const pan = useCallback((dx: number, dy: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setView((v) => {
      if (v.s === MIN) return v;
      const lx = (r.width * (v.s - 1)) / 2;
      const ly = (r.height * (v.s - 1)) / 2;
      return { ...v, x: clamp(v.x + dx, -lx, lx), y: clamp(v.y + dy, -ly, ly) };
    });
  }, []);

  const step = useCallback(
    (factor: number) => {
      const r = box.current?.getBoundingClientRect();
      if (!r) return;
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, viewRef.current.s * factor);
    },
    [zoomAt],
  );

  /* --------------------------------------------------------------- clavier */
  useEffect(() => {
    closeBtn.current?.focus();
    document.body.classList.add("is-locked");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(index - 1);
      else if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "+" || e.key === "=") step(1.4);
      else if (e.key === "-") step(1 / 1.4);
      else if (e.key === "0") setView(RESET);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("is-locked");
    };
  }, [go, index, onClose, step]);

  /**
   * La molette est branchée à la main : React pose ses gestionnaires en mode
   * passif, et un gestionnaire passif ne peut pas appeler preventDefault — la
   * page défilerait derrière la visionneuse à chaque cran de molette.
   */
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, viewRef.current.s * Math.exp(-e.deltaY * 0.0016));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  /* --------------------------------------------------- souris et tactile */
  const onPointerDown = (e: React.PointerEvent) => {
    moved.current = false;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    box.current?.setPointerCapture(e.pointerId);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, s: viewRef.current.s };
    } else if (viewRef.current.s > MIN) {
      setDragging(true);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    if (Math.hypot(e.clientX - prev.x, e.clientY - prev.y) > 2) moved.current = true;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, pinch.current.s * (dist / pinch.current.dist));
    } else if (pointers.current.size === 1 && viewRef.current.s > MIN) {
      pan(e.clientX - prev.x, e.clientY - prev.y);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) setDragging(false);
  };

  const zoomed = view.s > MIN;

  /**
   * Rendu dans une portale sur `document.body` : la galerie vit dans une
   * `.section` qui porte `position: relative; z-index: 2`, ce qui crée un
   * contexte d'empilement. Rendue sur place, la visionneuse serait plafonnée
   * à ce niveau 2 et passerait sous l'en-tête, quel que soit son z-index.
   */
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col"
      style={{ background: "rgba(3, 8, 15, .965)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} — photo ${index + 1} sur ${photos.length}`}
    >
      {/* ---------------------------------------------------- barre d'outils */}
      <div className="relative z-[3] flex items-center gap-2 p-3 md:p-4 shrink-0">
        <span className="text-[12.5px] tnum mr-auto pl-1" style={{ color: "rgba(255,255,255,.62)" }}>
          {index + 1} / {photos.length}
        </span>
        <Tool label="Dézoomer" onClick={() => step(1 / 1.4)} disabled={!zoomed}>
          <line x1="6" y1="12" x2="18" y2="12" />
        </Tool>
        <button
          type="button"
          onClick={() => setView(RESET)}
          disabled={!zoomed}
          aria-label="Réinitialiser le zoom"
          className="h-10 min-w-[62px] px-3 rounded-full text-[12px] tnum border disabled:opacity-40"
          style={{ borderColor: "rgba(255,255,255,.2)", color: "rgba(255,255,255,.88)" }}
        >
          {Math.round(view.s * 100)} %
        </button>
        <Tool label="Zoomer" onClick={() => step(1.4)} disabled={view.s >= MAX}>
          <line x1="6" y1="12" x2="18" y2="12" />
          <line x1="12" y1="6" x2="12" y2="18" />
        </Tool>
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label="Fermer la visionneuse"
          className="w-10 h-10 rounded-full grid place-items-center border transition-transform duration-300 hover:rotate-90"
          style={{ borderColor: "rgba(255,255,255,.2)", color: "#fff" }}
        >
          <Close />
        </button>
      </div>

      {/* ---------------------------------------------------------- image */}
      <div
        ref={box}
        className="relative flex-1 min-h-0 overflow-hidden"
        style={{ cursor: dragging ? "grabbing" : zoomed ? "grab" : "zoom-in", touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={(e) => {
          // e.detail vaut 2 au second clic d'un double-clic : on l'ignore pour
          // qu'un double-clic zoome une fois au lieu d'aller-retour
          if (e.detail !== 1 || moved.current) return;
          if (zoomed) setView(RESET);
          else zoomAt(e.clientX, e.clientY, 2.5);
        }}
      >
        <div
          className="absolute inset-0 grid place-items-center p-4 md:p-8 pointer-events-none"
          style={{
            transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s})`,
            transformOrigin: "center",
            transition: dragging ? "none" : "transform .2s cubic-bezier(.19,.72,.3,1)",
          }}
        >
          <div className="relative w-full h-full">
            <Image
              key={photos[index]}
              src={photos[index]}
              alt={`${alt} — photo ${index + 1}`}
              fill
              sizes="100vw"
              priority
              draggable={false}
              className="object-contain select-none"
            />
          </div>
        </div>

        {photos.length > 1 && (
          <>
            <Side side="left" onClick={() => go(index - 1)} />
            <Side side="right" onClick={() => go(index + 1)} />
          </>
        )}
      </div>

      {/* ------------------------------------------------------- pellicule */}
      {photos.length > 1 && (
        <div className="relative z-[3] flex gap-2 justify-center overflow-x-auto p-3 md:p-4 shrink-0">
          {photos.map((p, n) => (
            <button
              key={p}
              type="button"
              onClick={() => go(n)}
              aria-label={`Voir la photo ${n + 1}`}
              aria-current={n === index}
              className="relative shrink-0 w-[76px] aspect-[16/10] rounded-lg overflow-hidden border transition-all duration-300"
              style={{
                borderColor: n === index ? "var(--brand)" : "rgba(255,255,255,.16)",
                opacity: n === index ? 1 : 0.5,
              }}
            >
              <Image src={p} alt="" fill sizes="76px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <p className="hidden md:block text-center text-[11.5px] pb-3" style={{ color: "rgba(255,255,255,.4)" }}>
        Molette ou clic pour zoomer · glisser pour déplacer · ← → pour changer de photo · Échap pour fermer
      </p>
    </motion.div>,
    document.body,
  );
}

function Tool({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-10 h-10 rounded-full grid place-items-center border transition-opacity disabled:opacity-30"
      style={{ borderColor: "rgba(255,255,255,.2)", color: "#fff" }}
    >
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        {children}
      </svg>
    </button>
  );
}

function Side({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={side === "left" ? "Photo précédente" : "Photo suivante"}
      className={`absolute top-1/2 -translate-y-1/2 z-[4] w-12 h-12 rounded-full grid place-items-center
                  border opacity-70 hover:opacity-100 transition-opacity ${side === "left" ? "left-3" : "right-3"}`}
      style={{ borderColor: "rgba(255,255,255,.2)", background: "rgba(3,8,15,.55)", color: "#fff" }}
    >
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2"
           strokeLinecap="round" strokeLinejoin="round" aria-hidden
           style={{ transform: side === "right" ? "rotate(180deg)" : undefined }}>
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
