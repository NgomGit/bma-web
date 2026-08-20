"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Silhouette } from "@/components/vehicle/VehicleVisual";
import { Arrow, Doc, Key, Phone, Ship, Shield } from "@/components/ui/icons";
import type { Vehicle } from "@/data/vehicles";
import { site } from "@/lib/site";

const LINES = ["Le véhicule", "qui vous", "ressemble."];
const ROTATE_MS = 5200;

export function Hero({ vehicles }: { vehicles: Vehicle[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const featured = vehicles;
  const v = featured[i];

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => {
    if (paused) return stop();
    timer.current = setInterval(() => setI((k) => (k + 1) % featured.length), ROTATE_MS);
    return stop;
  }, [paused, stop]);

  // met en pause quand l'onglet passe en arrière-plan
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const specs: [string, string][] = [
    ["Année", String(v.year)],
    ["Kilométrage", v.mileage],
    ["Motorisation", v.engine],
    ["Puissance", v.power],
  ];

  return (
    <section
      id="top"
      className="relative z-[2] flex flex-col justify-center min-h-[100svh]"
      style={{ paddingTop: "calc(var(--nav) + 26px)" }}
    >
      <div className="wrap w-full">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,.96fr)_minmax(0,1.04fr)] lg:gap-11 lg:items-center">
          {/* ---------- colonne éditoriale ---------- */}
          <div>
            <span className="kicker mb-5">Baye Mor Automobile · Dakar</span>
            <h1 className="display">
              {LINES.map((l, k) => (
                <span key={l} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    style={k === 2 ? { color: "var(--brand)" } : undefined}
                    initial={{ y: "108%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1, delay: k * 0.09, ease: [0.19, 0.72, 0.3, 1] }}
                  >
                    {l}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p
              className="lead mt-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42, duration: 0.9 }}
            >
              Un parc vérifié pièce par pièce, des papiers en règle, et la possibilité de commander depuis
              l&apos;étranger le modèle exact que vous cherchez. Le prix se discute de vive voix — comme il se doit.
            </motion.p>
            <motion.div
              className="mt-7 flex flex-wrap gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.54, duration: 0.9 }}
            >
              <a href="#parc" className="btn btn--primary flex-auto sm:flex-none min-w-[158px]">
                Découvrir le parc <Arrow />
              </a>
              <a href={`tel:${site.phone}`} className="btn btn--ghost flex-auto sm:flex-none min-w-[158px]">
                <Phone /> Appeler Baye Mor
              </a>
            </motion.div>
          </div>

          {/* ---------- scène tournante ---------- */}
          <motion.div
            className="stage relative rounded-[var(--r4)] border overflow-hidden"
            style={{ borderColor: "var(--line)", boxShadow: "var(--sh-l)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
          >
            <div className="relative px-4.5 pt-6 pb-5 md:px-9 md:pt-10 md:pb-7" style={{ padding: "26px 18px 20px" }}>
              <span
                className="absolute left-1/2 top-[29%] -translate-x-1/2 -translate-y-1/2 z-0 whitespace-nowrap
                           font-bold tracking-[.02em] select-none pointer-events-none"
                style={{
                  fontSize: "clamp(64px,13vw,150px)",
                  color: "transparent",
                  WebkitTextStroke: "1px var(--line-2)",
                  opacity: 0.4,
                }}
              >
                {v.brand.split("-")[0].toUpperCase()}
              </span>

              <div className="relative z-[2] aspect-[16/8] grid place-items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={v.slug}
                    className="w-full h-full max-w-[640px] relative grid place-items-center"
                    initial={{ opacity: 0, x: 28, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -28, scale: 0.98 }}
                    transition={{ duration: 0.65, ease: [0.19, 0.72, 0.3, 1] }}
                  >
                    {v.photos?.length ? (
                      <Image
                        src={v.photos[0]}
                        alt={`${v.brand} ${v.model} ${v.year} — disponible chez BMA à Dakar`}
                        fill
                        sizes="(max-width: 1024px) 92vw, 640px"
                        priority
                        className="object-contain"
                      />
                    ) : (
                      <Silhouette body={v.body} className="w-full" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div
                className="relative z-[3] flex items-end justify-between gap-4 mt-1.5 pt-4.5 border-t"
                style={{ borderColor: "var(--line)", paddingTop: 18 }}
              >
                <div className="min-w-0">
                  <span className="block text-[10px] font-medium tracking-[.24em] uppercase" style={{ color: "var(--brand)" }}>
                    {v.brand}
                  </span>
                  <h2 className="mt-1.5 tracking-[-.03em]" style={{ fontSize: "clamp(19px,3.4vw,27px)" }}>
                    {v.model}
                  </h2>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {featured.map((f, k) => (
                    <button
                      key={f.slug}
                      onClick={() => setI(k)}
                      aria-label={`Véhicule ${k + 1} : ${f.model}`}
                      className="h-[3px] rounded-[9px] transition-all duration-400"
                      style={{ width: k === i ? 44 : 26, background: k === i ? "var(--brand)" : "var(--line-2)" }}
                    />
                  ))}
                </div>
              </div>

              <div
                className="relative z-[3] grid grid-cols-2 sm:grid-cols-4 gap-px mt-4.5 border-t"
                style={{ background: "var(--line)", borderColor: "var(--line)", marginTop: 18 }}
              >
                {specs.map(([k, val]) => (
                  <div key={k} className="p-3.5" style={{ background: "var(--surf)" }}>
                    <span className="block text-[9.5px] tracking-[.16em] uppercase" style={{ color: "var(--ink-3)" }}>
                      {k}
                    </span>
                    <b className="block mt-1 text-[14px] font-medium tnum">{val}</b>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ---------- bande de réassurance ---------- */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-px mt-7 border-y"
          style={{ background: "var(--line)", borderColor: "var(--line)" }}
        >
          {[
            [<Shield key="s" />, "Véhicules vérifiés"],
            [<Doc key="d" />, "Papiers en règle"],
            [<Key key="k" />, "Essai avant achat"],
            [<Ship key="p" />, "Import sur commande"],
          ].map(([icon, label]) => (
            <div
              key={String(label)}
              className="flex items-center gap-2.5 py-4 px-1 text-[12.5px] md:justify-center"
              style={{ background: "var(--bg)", color: "var(--ink-2)" }}
            >
              <span className="w-4 h-4 shrink-0" style={{ color: "var(--brand)" }}>
                {icon}
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
