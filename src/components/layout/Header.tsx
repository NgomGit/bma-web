"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Phone, WhatsApp } from "@/components/ui/icons";
import { nav, site, waGeneral } from "@/lib/site";

export function Header() {
  const { scrollY } = useScroll();
  const [stuck, setStuck] = useState(false);
  const [menu, setMenu] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setStuck(y > 16));

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-[90] flex items-center border-b transition-[background,border-color] duration-400"
        style={{
          height: "var(--nav)",
          background: stuck ? "var(--blur)" : "transparent",
          borderColor: stuck ? "var(--line)" : "transparent",
          backdropFilter: stuck ? "blur(20px) saturate(1.5)" : undefined,
          WebkitBackdropFilter: stuck ? "blur(20px) saturate(1.5)" : undefined,
        }}
      >
        <div className="wrap flex items-center gap-4">
          <Link href="/#top" className="group/logo mr-auto" aria-label="BMA Automobile — accueil">
            <Logo />
          </Link>

          <nav className="hidden lg:flex gap-0.5 mr-2">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="relative px-4 py-2.5 text-[13.5px] rounded-full transition-colors duration-300
                           after:content-[''] after:absolute after:inset-x-4 after:bottom-1.5 after:h-px
                           after:origin-left after:scale-x-0 after:transition-transform after:duration-400
                           hover:after:scale-x-100"
                style={{ color: "var(--ink-2)" }}
              >
                <span className="hover:text-[var(--ink)] transition-colors">{n.label}</span>
                <i className="absolute inset-x-4 bottom-1.5 h-px block" style={{ background: "transparent" }} />
              </Link>
            ))}
          </nav>

          <ThemeToggle />

          <a href={`tel:${site.phone}`} className="btn btn--primary btn--sm hidden lg:inline-flex">
            <Phone /> Appeler
          </a>

          <button
            onClick={() => setMenu((m) => !m)}
            aria-label="Menu"
            aria-expanded={menu}
            className="w-11 h-11 shrink-0 rounded-full border grid place-items-center lg:hidden"
            style={{ background: "var(--surf)", borderColor: "var(--line-2)", boxShadow: "var(--sh-s)" }}
          >
            <span className="grid gap-1">
              <i className="block w-4 h-[1.6px] rounded" style={{ background: "var(--ink)", transform: menu ? "translateY(5.6px) rotate(45deg)" : undefined, transition: "transform .35s var(--e)" }} />
              <i className="block w-4 h-[1.6px] rounded" style={{ background: "var(--ink)", opacity: menu ? 0 : 1, transition: "opacity .2s" }} />
              <i className="block w-4 h-[1.6px] rounded" style={{ background: "var(--ink)", transform: menu ? "translateY(-5.6px) rotate(-45deg)" : undefined, transition: "transform .35s var(--e)" }} />
            </span>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="fixed inset-0 z-[89] overflow-y-auto lg:hidden"
            style={{ background: "var(--bg)", padding: "calc(var(--nav) + 30px) var(--pad) 40px" }}
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.19, 0.72, 0.3, 1] }}
          >
            {nav.map((n, i) => (
              <motion.div
                key={n.href}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.06, duration: 0.5, ease: [0.19, 0.72, 0.3, 1] }}
              >
                <Link
                  href={n.href}
                  onClick={() => setMenu(false)}
                  className="flex items-baseline gap-3.5 border-b font-bold tracking-[-.04em]"
                  style={{ borderColor: "var(--line)", fontSize: "clamp(26px,7.5vw,38px)", paddingBlock: 18 }}
                >
                <em className="not-italic text-[11px] font-medium tracking-[.2em]" style={{ color: "var(--brand)" }}>
                  {n.index}
                </em>
                  {n.label}
                </Link>
              </motion.div>
            ))}
            <div className="grid gap-3 mt-7">
              <a href={`tel:${site.phone}`} className="btn btn--primary">
                <Phone /> Appeler maintenant
              </a>
              <a href={waGeneral()} target="_blank" rel="noopener" className="btn btn--wa">
                <WhatsApp /> WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
