"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { Phone, WhatsApp } from "@/components/ui/icons";
import { site, waGeneral } from "@/lib/site";

/** Barre d'action permanente sur mobile — apparaît après le hero */
export function MobileBar() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setShow(y > 460));

  return (
    <motion.div
      className="fixed left-0 right-0 bottom-0 z-[88] grid grid-cols-2 gap-2.5 border-t backdrop-blur-xl lg:hidden"
      style={{
        background: "var(--blur)",
        borderColor: "var(--line)",
        padding: "10px var(--pad) calc(10px + env(safe-area-inset-bottom))",
      }}
      initial={{ y: "130%" }}
      animate={{ y: show ? 0 : "130%" }}
      transition={{ duration: 0.45, ease: [0.19, 0.72, 0.3, 1] }}
    >
      <a href={`tel:${site.phone}`} className="btn btn--primary">
        <Phone /> Appeler
      </a>
      <a href={waGeneral()} target="_blank" rel="noopener" className="btn btn--wa">
        <WhatsApp /> WhatsApp
      </a>
    </motion.div>
  );
}
