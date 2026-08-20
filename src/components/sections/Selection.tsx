"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Arrow, ArrowLeft } from "@/components/ui/icons";
import { VehicleVisual } from "@/components/vehicle/VehicleVisual";
import { useVehicleSheet } from "@/components/vehicle/SheetProvider";
import { Reveal } from "@/components/ui/Reveal";
import type { Vehicle } from "@/data/vehicles";

/** Rail « Sélection » — défilement horizontal avec accroche, index de catalogue */
export function Selection({ vehicles }: { vehicles: Vehicle[] }) {
  const featured = vehicles;
  const rail = useRef<HTMLDivElement>(null);
  const { open } = useVehicleSheet();

  const scrollBy = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = (card?.getBoundingClientRect().width ?? 320) + 16;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  return (
    <section className="section" id="selection">
      <div className="wrap">
        <Reveal className="grid gap-4 mb-9 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-8">
          <div>
            <span className="kicker">01 — Sélection</span>
            <h2 className="h2 mt-4">
              Les pièces fortes
              <br />
              du moment
            </h2>
            <p className="lead mt-3.5">
              Trois véhicules que nous recommandons cette semaine, choisis pour leur état, leur historique et leur
              dossier complet.
            </p>
          </div>
          <div className="flex gap-2.5">
            {[
              { dir: -1 as const, icon: <ArrowLeft />, label: "Précédent" },
              { dir: 1 as const, icon: <Arrow />, label: "Suivant" },
            ].map((b) => (
              <button
                key={b.label}
                onClick={() => scrollBy(b.dir)}
                aria-label={b.label}
                className="w-11 h-11 rounded-full border grid place-items-center transition-colors duration-300 hover:text-[var(--brand)] hover:border-[var(--brand)] text-[16px]"
                style={{ background: "var(--surf)", borderColor: "var(--line-2)", boxShadow: "var(--sh-s)" }}
              >
                {b.icon}
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="wrap">
        <div
          ref={rail}
          className="flex gap-4 overflow-x-auto no-bar snap-x snap-mandatory"
          style={{ margin: "0 calc(var(--pad) * -1)", padding: "4px var(--pad) 22px" }}
        >
          {featured.map((v, i) => (
            <motion.button
              key={v.slug}
              data-card
              onClick={() => open(v)}
              className="group/stage snap-start shrink-0 basis-[84%] md:basis-[46%] xl:basis-[31.5%]
                         card text-left overflow-hidden"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.19, 0.72, 0.3, 1] }}
              style={{ borderRadius: "var(--r4)", boxShadow: "var(--sh-m)" }}
            >
              <div className="stage relative aspect-[16/10] grid place-items-center p-4 overflow-hidden">
                <span className="scanline" />
                <span
                  className="absolute left-4 top-3.5 z-[3] text-[11px] font-medium tracking-[.14em] tnum"
                  style={{ color: "var(--ink-3)" }}
                >
                  0{i + 1} / 0{featured.length}
                </span>
                <span className="relative z-[2] w-full transition-transform duration-700 group-hover/stage:translate-x-2.5 group-hover/stage:scale-[1.05]">
                  <VehicleVisual vehicle={v} priority={i === 0} />
                </span>
              </div>
              <div className="p-5">
                <span className="block text-[9.5px] font-medium tracking-[.2em] uppercase" style={{ color: "var(--brand)" }}>
                  {v.brand}
                </span>
                <h3 className="text-[21px] mt-1.5 tracking-[-.03em]">{v.model}</h3>
                <div className="mt-4 flex items-center justify-between gap-3 pt-3.5 border-t" style={{ borderColor: "var(--line)" }}>
                  <span>
                    <small className="block text-[11px]" style={{ color: "var(--ink-3)" }}>
                      Prix sur demande
                    </small>
                    <b className="block text-[13.5px] font-medium tnum">
                      {v.year} · {v.mileage}
                    </b>
                  </span>
                  <span
                    className="w-10 h-10 rounded-full border grid place-items-center shrink-0 transition-all duration-400
                               group-hover/stage:bg-[var(--brand)] group-hover/stage:border-[var(--brand)]
                               group-hover/stage:text-white group-hover/stage:-rotate-45"
                    style={{ borderColor: "var(--line-2)" }}
                  >
                    <Arrow className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
