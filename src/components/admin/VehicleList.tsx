"use client";

import Image from "next/image";
import Link from "next/link";
import { Reorder, useDragControls } from "framer-motion";
import { useEffect, useRef, useState, useTransition } from "react";
import { Silhouette } from "@/components/vehicle/VehicleVisual";
import { duplicateVehicle, saveOrder, toggleFeatured } from "@/app/admin/actions";
import { BODY_LABELS, type Vehicle } from "@/data/vehicles";

/**
 * Liste du parc, réordonnable au glisser-déposer.
 *
 * Trois exigences ont guidé l'implémentation :
 *
 * 1. **Le glissement ne part que de la poignée.** Une ligne entièrement
 *    draggable rendrait impossible la sélection de texte et le défilement tactile.
 * 2. **Le clavier reste opérationnel.** Remplacer des boutons par du
 *    glisser-déposer exclut les utilisateurs au clavier ; la poignée est donc
 *    focusable et répond à ↑ / ↓. Un message `aria-live` annonce chaque
 *    déplacement.
 * 3. **L'enregistrement est différé et optimiste.** L'ordre s'applique
 *    immédiatement à l'écran, et une seule écriture part 700 ms après le dernier
 *    déplacement — pas une par cran parcouru.
 */

const SAVE_DELAY = 700;

export function VehicleList({ vehicles }: { vehicles: Vehicle[] }) {
  const [items, setItems] = useState(vehicles);
  const [saving, startSaving] = useTransition();
  const [state, setState] = useState<"idle" | "pending" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // la liste peut changer côté serveur (ajout, suppression) : on resynchronise
  useEffect(() => setItems(vehicles), [vehicles]);

  const persist = (next: Vehicle[]) => {
    if (timer.current) clearTimeout(timer.current);
    setState("pending");
    timer.current = setTimeout(() => {
      startSaving(async () => {
        const res = await saveOrder(next.map((v) => v.slug));
        setState(res.error ? "error" : "saved");
        if (res.error) setMessage(res.error);
      });
    }, SAVE_DELAY);
  };

  const onReorder = (next: Vehicle[]) => {
    setItems(next);
    persist(next);
  };

  /** Déplacement au clavier — même chemin de persistance que la souris */
  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    persist(next);
    setMessage(`${next[j].model} déplacé en position ${j + 1} sur ${next.length}`);
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-3">
        <p className="text-[12.5px]" style={{ color: "var(--ink-3)" }}>
          Glissez une ligne par sa poignée pour changer l&apos;ordre du site. Au clavier : focus sur la
          poignée, puis ↑ ou ↓.
        </p>
        <span
          className="text-[12px] shrink-0 transition-opacity duration-300"
          style={{
            opacity: state === "idle" ? 0 : 1,
            color: state === "error" ? "#E5484D" : state === "saved" ? "#2FBB74" : "var(--ink-3)",
          }}
          role="status"
        >
          {state === "pending" || saving ? "Enregistrement…" : state === "saved" ? "Ordre enregistré" : message}
        </span>
      </div>

      {/* annonce lecteur d'écran, invisible à l'œil */}
      <span aria-live="polite" className="sr-only">
        {message}
      </span>

      <Reorder.Group axis="y" values={items} onReorder={onReorder} className="grid gap-3 list-none p-0 m-0">
        {items.map((v, i) => (
          <Row key={v.slug} vehicle={v} index={i} total={items.length} onMove={move} />
        ))}
      </Reorder.Group>
    </>
  );
}

function Row({
  vehicle: v,
  index,
  total,
  onMove,
}: {
  vehicle: Vehicle;
  index: number;
  total: number;
  onMove: (index: number, dir: -1 | 1) => void;
}) {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);

  return (
    <Reorder.Item
      value={v}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      className="card p-3 grid gap-3 items-center hover:translate-y-0
                 grid-cols-[28px_72px_minmax(0,1fr)] sm:grid-cols-[28px_92px_minmax(0,1fr)_auto]"
      style={{
        position: "relative",
        zIndex: dragging ? 10 : 1,
        boxShadow: dragging ? "var(--sh-l)" : "var(--sh-s)",
        borderColor: dragging ? "var(--brand)" : "var(--line)",
        cursor: dragging ? "grabbing" : undefined,
      }}
      whileDrag={{ scale: 1.015 }}
    >
      {/* poignée : seul point de départ du glissement, et cible du clavier */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          controls.start(e);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") { e.preventDefault(); onMove(index, -1); }
          if (e.key === "ArrowDown") { e.preventDefault(); onMove(index, 1); }
        }}
        aria-label={`Déplacer ${v.brand} ${v.model} — position ${index + 1} sur ${total}. Flèches haut et bas pour déplacer.`}
        className="w-7 h-9 grid place-items-center rounded-lg transition-colors self-stretch"
        style={{ color: "var(--ink-3)", cursor: "grab", touchAction: "none" }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
          <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" />
          <circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" />
          <circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
        </svg>
      </button>

      <span className="stage relative aspect-[16/10] w-full rounded-[10px] overflow-hidden grid place-items-center p-1.5">
        {v.photos?.length ? (
          <Image src={v.photos[0]} alt="" fill sizes="92px" className="object-cover" />
        ) : (
          <Silhouette body={v.body} className="w-full relative z-[2]" />
        )}
      </span>

      <div className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-medium tracking-[.16em] uppercase" style={{ color: "var(--brand)" }}>
            {v.brand}
          </span>
          {v.featured && (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
              style={{ color: "#F4B740", borderColor: "rgba(244,183,64,.4)" }}
            >
              En avant
            </span>
          )}
        </span>
        <h2 className="text-[16.5px] tracking-[-.025em] mt-1 truncate">{v.model}</h2>
        <p className="text-[12px] mt-0.5 tnum" style={{ color: "var(--ink-3)" }}>
          <span className="tnum">{index + 1}.</span> {v.year} · {v.mileage} · {v.gearbox} · {BODY_LABELS[v.body]}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 justify-end col-span-3 sm:col-span-1">
        <form action={toggleFeatured}>
          <input type="hidden" name="slug" value={v.slug} />
          <button type="submit" className="btn btn--ghost btn--sm" style={{ minHeight: 36 }}>
            {v.featured ? "Retirer" : "Mettre en avant"}
          </button>
        </form>
        <form action={duplicateVehicle}>
          <input type="hidden" name="slug" value={v.slug} />
          <button type="submit" className="btn btn--ghost btn--sm" style={{ minHeight: 36 }}>
            Dupliquer
          </button>
        </form>
        <Link href={`/admin/vehicules/${v.slug}`} className="btn btn--primary btn--sm" style={{ minHeight: 36 }}>
          Modifier
        </Link>
      </div>
    </Reorder.Item>
  );
}
