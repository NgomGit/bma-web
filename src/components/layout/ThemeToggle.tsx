"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@/components/ui/icons";

type Theme = "dark" | "light";

/** Bascule clair / sombre — la préférence est mémorisée sur l'appareil */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme((document.documentElement.dataset.theme as Theme) ?? "dark");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("bma-theme", next); } catch {}
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "dark" ? "#050E1C" : "#F1F5F9");
  };

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre"}
      className="w-11 h-11 shrink-0 rounded-full border grid place-items-center transition-transform duration-300 hover:rotate-[18deg] text-[17px]"
      style={{ background: "var(--surf)", borderColor: "var(--line-2)", boxShadow: "var(--sh-s)" }}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  );
}
