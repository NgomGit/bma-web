"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Silhouette } from "./VehicleVisual";
import { SpecGrid } from "./SpecGrid";
import { Arrow, Close, Phone, WhatsApp } from "@/components/ui/icons";
import { site, waVehicle } from "@/lib/site";
import { formatPrice, type Vehicle } from "@/data/vehicles";

type Ctx = { open: (v: Vehicle) => void; close: () => void };
const SheetCtx = createContext<Ctx | null>(null);

const EASE: [number, number, number, number] = [0.19, 0.72, 0.3, 1];

/** Vrai au-delà de 1024 px — le panneau change de mise en scène */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return isDesktop;
}

export const useVehicleSheet = () => {
  const c = useContext(SheetCtx);
  if (!c) throw new Error("useVehicleSheet doit être utilisé dans <VehicleSheetProvider>");
  return c;
};

export function VehicleSheetProvider({ children }: { children: ReactNode }) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [tint, setTint] = useState<string | undefined>();
  const isDesktop = useIsDesktop();

  const open = useCallback((v: Vehicle) => {
    setVehicle(v);
    setTint(v.swatches[0]);
  }, []);
  const close = useCallback(() => setVehicle(null), []);
  const ctx = useMemo(() => ({ open, close }), [open, close]);

  useEffect(() => {
    document.body.classList.toggle("is-locked", !!vehicle);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", esc);
    return () => {
      document.body.classList.remove("is-locked");
      window.removeEventListener("keydown", esc);
    };
  }, [vehicle, close]);


  return (
    <SheetCtx.Provider value={ctx}>
      {children}
      <AnimatePresence>
        {vehicle && (
          <>
            <motion.div
              key="ov"
              className="fixed inset-0 z-[190] backdrop-blur-sm"
              style={{ background: "var(--blur)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              onClick={close}
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label={`${vehicle.brand} ${vehicle.model}`}
              /**
               * Centrage sur desktop : `inset-0` + `m-auto`, jamais un
               * translate(-50%,-50%). Framer Motion pilote la propriété
               * `transform` pendant l'animation — tout centrage par transform
               * serait écrasé et le panneau partirait en bas à droite.
               * Les marges automatiques, elles, ne sont jamais touchées.
               */
              className="fixed inset-0 z-[191] flex flex-col overflow-hidden
                         lg:m-auto lg:h-[min(760px,90vh)] lg:w-[min(1180px,94vw)]
                         lg:flex-row lg:rounded-[var(--r4)] lg:border"
              style={{ background: "var(--bg)", borderColor: "var(--line)", boxShadow: "var(--sh-l)" }}
              {...(isDesktop
                ? {
                    initial: { opacity: 0, y: 26, scale: 0.985 },
                    animate: { opacity: 1, y: 0, scale: 1 },
                    exit: { opacity: 0, y: 18, scale: 0.985 },
                    transition: { duration: 0.42, ease: EASE },
                  }
                : {
                    initial: { y: "100%" },
                    animate: { y: 0 },
                    exit: { y: "100%" },
                    transition: { duration: 0.55, ease: EASE },
                  })}
            >
              <button
                onClick={close}
                aria-label="Fermer"
                className="absolute top-3.5 right-3.5 z-10 w-[42px] h-[42px] rounded-full grid place-items-center
                           border transition-transform duration-300 hover:rotate-90 text-[16px]"
                style={{ background: "var(--surf)", borderColor: "var(--line-2)", boxShadow: "var(--sh-s)" }}
              >
                <Close />
              </button>

              {/* ---------- scène ---------- */}
              <div
                className="stage relative shrink-0 grid place-items-center border-b
                           px-5 pt-16 pb-6 lg:basis-[46%] lg:border-b-0 lg:border-r lg:p-9"
                style={{ borderColor: "var(--line)" }}
              >
                <span
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 whitespace-nowrap
                             font-bold tracking-[-.06em] select-none pointer-events-none"
                  style={{
                    fontSize: "clamp(52px,11vw,110px)",
                    color: "transparent",
                    WebkitTextStroke: "1px var(--line-2)",
                    opacity: 0.55,
                  }}
                >
                  {vehicle.brand.split("-")[0].toUpperCase()}
                </span>
                <div className="relative z-[2] w-full max-w-[530px]">
                  {vehicle.photos?.length ? (
                    <Image
                      src={vehicle.photos[0]}
                      alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${vehicle.color}`}
                      width={1440}
                      height={900}
                      className="w-full h-auto rounded-[var(--r2)]"
                    />
                  ) : (
                    <Silhouette body={vehicle.body} tint={tint} className="w-full" />
                  )}
                  {/* nuancier : il ne repeint que le tracé — inutile dès qu'il y a une photo */}
                  <div className={`relative z-[3] mt-6 flex-wrap justify-center gap-2.5 ${vehicle.photos?.length ? "hidden" : "flex"}`}>
                    {vehicle.swatches.map((c) => (
                      <button
                        key={c}
                        onClick={() => setTint(c)}
                        aria-label={`Teinte ${c}`}
                        className="w-[30px] h-[30px] rounded-full border-2 transition-transform duration-300 relative"
                        style={{
                          borderColor: tint === c ? "var(--brand)" : "var(--line-2)",
                          transform: tint === c ? "scale(1.12)" : undefined,
                        }}
                      >
                        <span
                          className="absolute inset-[3px] rounded-full"
                          style={{ background: c, boxShadow: "inset 0 2px 4px rgba(255,255,255,.35)" }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ---------- contenu ---------- */}
              <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
                <div className="px-5 pt-6 md:px-8 md:pt-9">
                  <span className="kicker">
                    Disponible au showroom
                  </span>
                  <h2 className="h2 mt-3.5" style={{ fontSize: "clamp(24px,4vw,38px)" }}>
                    {vehicle.model}
                  </h2>
                  {/* Même règle que sur la fiche : pas de provenance sous
                      « Disponible au showroom ». Et pas d'année ni de
                      kilométrage non plus — ils sont juste en dessous, dans la
                      grille. Il ne reste que la marque, qui manque au titre. */}
                  <p className="lead mt-2.5">{vehicle.brand}</p>

                  {/* le prix d'abord, la fiche technique ensuite */}
                  <div
                    className="mt-5 mb-5 rounded-[var(--r2)] border p-4 px-5"
                    style={{ background: "var(--surf-2)", borderColor: "var(--line-2)" }}
                  >
                    <span className="block text-[9.5px] tracking-[.16em] uppercase" style={{ color: "var(--ink-3)" }}>
                      Prix
                    </span>
                    {vehicle.price ? (
                      <b className="block mt-1.5 text-[24px] font-bold tracking-[-.03em] tnum" style={{ color: "var(--brand)" }}>
                        {formatPrice(vehicle.price)}
                      </b>
                    ) : (
                      <b className="block mt-1.5 text-[18px] font-medium">Prix communiqué par téléphone</b>
                    )}
                  </div>

                  <SpecGrid vehicle={vehicle} className="mb-6" />

                  {/* La navigation est côté client : sans ce `close`, le panneau
                      resterait ouvert par-dessus la fiche qui vient de s'afficher. */}
                  <Link
                    href={`/vehicules/${vehicle.slug}`}
                    onClick={close}
                    className="inline-flex items-center gap-2 text-[13px] font-medium mb-8"
                    style={{ color: "var(--brand)" }}
                  >
                    Ouvrir la fiche complète <Arrow className="w-4 h-4" />
                  </Link>
                </div>

                <div
                  className="sticky bottom-0 mt-auto grid grid-cols-2 gap-2.5 px-5 py-3.5 md:px-8 md:py-4 border-t"
                  style={{ background: "var(--bg)", borderColor: "var(--line)", paddingBottom: "calc(14px + env(safe-area-inset-bottom))" }}
                >
                  <a href={`tel:${site.phone}`} className="btn btn--primary">
                    <Phone /> Appeler
                  </a>
                  <a
                    href={waVehicle(vehicle.brand, vehicle.model, vehicle.year)}
                    target="_blank"
                    rel="noopener"
                    className="btn btn--wa"
                  >
                    <WhatsApp /> WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </SheetCtx.Provider>
  );
}
