"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Silhouette } from "./VehicleVisual";
import { Arrow, Check, Close, Phone, WhatsApp } from "@/components/ui/icons";
import { site, waVehicle } from "@/lib/site";
import type { Vehicle } from "@/data/vehicles";

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

const TABS = ["Fiche technique", "Équipements", "Le mot de BMA"] as const;

export function VehicleSheetProvider({ children }: { children: ReactNode }) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [tab, setTab] = useState(0);
  const [tint, setTint] = useState<string | undefined>();
  const isDesktop = useIsDesktop();

  const open = useCallback((v: Vehicle) => {
    setVehicle(v);
    setTab(0);
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

  const specs = vehicle
    ? ([
        ["Année", String(vehicle.year)],
        ["Kilométrage", vehicle.mileage],
        ["Boîte", vehicle.gearbox],
        ["Carburant", vehicle.fuel],
        ["Motorisation", `${vehicle.engine} · ${vehicle.power}`],
        ["Places", String(vehicle.seats)],
        ["Couleur", vehicle.color],
        ["Transmission", vehicle.drivetrain],
        ["Carrosserie", vehicle.bodywork],
      ] as const)
    : [];

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
                    {vehicle.status === "commande" ? `Sur commande · ${vehicle.lead}` : "Disponible au showroom"}
                  </span>
                  <h2 className="h2 mt-3.5" style={{ fontSize: "clamp(24px,4vw,38px)" }}>
                    {vehicle.model}
                  </h2>
                  <p className="lead mt-2.5">
                    {vehicle.brand} · {vehicle.origin}
                  </p>

                  <div className="flex gap-0.5 mt-5 border-b overflow-x-auto no-bar" style={{ borderColor: "var(--line)" }}>
                    {TABS.map((t, i) => (
                      <button
                        key={t}
                        onClick={() => setTab(i)}
                        className="relative shrink-0 whitespace-nowrap px-3.5 py-3 text-[13px] transition-colors"
                        style={{ color: tab === i ? "var(--ink)" : "var(--ink-3)", fontWeight: tab === i ? 500 : 300 }}
                      >
                        {t}
                        {tab === i && (
                          <motion.span
                            layoutId="tab-underline"
                            className="absolute left-3.5 right-3.5 -bottom-px h-0.5 rounded"
                            style={{ background: "var(--brand)" }}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="py-6">
                    {tab === 0 && (
                      <div
                        className="grid grid-cols-2 sm:grid-cols-3 gap-px rounded-[var(--r2)] overflow-hidden border"
                        style={{ background: "var(--line)", borderColor: "var(--line)" }}
                      >
                        {specs.map(([k, v]) => (
                          <div key={k} className="p-3.5" style={{ background: "var(--surf)" }}>
                            <span className="block text-[9.5px] tracking-[.15em] uppercase" style={{ color: "var(--ink-3)" }}>
                              {k}
                            </span>
                            <b className="block mt-1.5 text-[14px] font-medium">{v}</b>
                          </div>
                        ))}
                      </div>
                    )}
                    {tab === 1 && (
                      <ul className="grid sm:grid-cols-2 gap-2.5 list-none p-0 m-0">
                        {vehicle.equipment.map((e) => (
                          <li key={e} className="flex gap-2.5 text-[13.5px]" style={{ color: "var(--ink-2)" }}>
                            <Check className="w-[15px] h-[15px] shrink-0 mt-[3px]" />
                            <span>{e}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {tab === 2 && <p className="lead">{vehicle.note}</p>}
                  </div>

                  <div
                    className="p-4 px-[18px] rounded-[var(--r2)] border text-[13px] mb-6"
                    style={{ background: "var(--surf-2)", borderColor: "var(--line-2)", color: "var(--ink-2)" }}
                  >
                    <b style={{ color: "var(--ink)", fontWeight: 500 }}>Prix communiqué sur demande.</b> Le tarif dépend de
                    l&apos;état exact du véhicule et de votre mode de paiement. Appelez ou écrivez sur WhatsApp — réponse le
                    jour même.
                  </div>

                  <Link
                    href={`/vehicules/${vehicle.slug}`}
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
