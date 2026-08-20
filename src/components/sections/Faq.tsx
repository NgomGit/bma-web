"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Plus } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { faqItems } from "@/data/faq";


export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section pt-0">
      <div className="wrap" style={{ maxWidth: 900 }}>
        <Reveal className="mb-9">
          <span className="kicker">Questions fréquentes</span>
          <h2 className="h2 mt-4">Ce qu&apos;on nous demande</h2>
        </Reveal>
        <Reveal className="rounded-[var(--r3)] border overflow-hidden" >
          <div style={{ background: "var(--surf)", boxShadow: "var(--sh-s)" }}>
            {faqItems.map((f, i) => {
              const on = open === i;
              return (
                <div key={f.q} className={i ? "border-t" : ""} style={{ borderColor: "var(--line)" }}>
                  <button
                    onClick={() => setOpen(on ? null : i)}
                    aria-expanded={on}
                    className="w-full flex items-center justify-between gap-4 px-5 py-5.5 text-left text-[15.5px] transition-colors"
                    style={{ paddingBlock: 22 }}
                  >
                    {f.q}
                    <span
                      className="w-7 h-7 rounded-full border grid place-items-center shrink-0 transition-transform duration-400 text-[12px]"
                      style={{
                        borderColor: on ? "var(--brand)" : "var(--line-2)",
                        background: on ? "var(--brand)" : "transparent",
                        color: on ? "#fff" : "var(--brand)",
                        transform: on ? "rotate(135deg)" : undefined,
                      }}
                    >
                      <Plus />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.42, ease: [0.19, 0.72, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5.5 text-[14px] max-w-[70ch]" style={{ color: "var(--ink-2)", paddingBottom: 22 }}>
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
