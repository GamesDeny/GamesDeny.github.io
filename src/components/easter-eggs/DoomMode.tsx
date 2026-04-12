"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";

const CLICKS_REQUIRED = 4;
const CLICK_WINDOW_MS = 800;

type Phase = "activated" | "stats";

interface Props {
  enabled: boolean;
}

export default function DoomMode({ enabled }: Props) {
  const { t } = useI18n();
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("activated");
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── attach click listener to the hero name element ─────────────────────────
  useEffect(() => {
    if (!enabled) return;
    const el = document.getElementById("hero-name");
    if (!el) return;

    const handleClick = () => {
      clickCountRef.current += 1;

      if (clickCountRef.current >= CLICKS_REQUIRED) {
        clickCountRef.current = 0;
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
        setPhase("activated");
        setActive(true);
        return;
      }

      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, CLICK_WINDOW_MS);
    };

    el.addEventListener("click", handleClick);
    el.style.cursor = "default";
    return () => {
      el.removeEventListener("click", handleClick);
      el.style.cursor = "";
    };
  }, [enabled]);

  // ── activated → stats ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!active || phase !== "activated") return;
    const t = setTimeout(() => setPhase("stats"), 1200);
    return () => clearTimeout(t);
  }, [active, phase]);

  // ── dismiss on any key or click once stats are visible ────────────────────
  useEffect(() => {
    if (!active || phase !== "stats") return;
    const dismiss = () => setActive(false);
    const timer = setTimeout(() => {
      window.addEventListener("keydown", dismiss, { once: true });
      window.addEventListener("click", dismiss, { once: true });
    }, 400);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("click", dismiss);
    };
  }, [active, phase]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black font-mono flex flex-col items-start justify-center p-8 md:p-24 overflow-hidden">
      <div className="absolute inset-0 bg-red-900/10 pointer-events-none" />

      <p className="text-red-500/60 text-xs mb-10 tracking-widest uppercase">
        {t.easterEggs.doom.header}
      </p>

      <p
        className="text-red-500 text-2xl md:text-4xl font-bold tracking-widest mb-2"
        style={{ textShadow: "0 0 30px #ef4444, 0 0 60px #ef4444" }}
      >
        IDDQD
      </p>

      <p className="text-red-400 text-lg md:text-2xl font-bold tracking-widest mb-1">
        {t.easterEggs.doom.mode}
      </p>

      {phase === "stats" && (
        <div className="mt-10 space-y-3 text-sm">
          <div className="flex items-center gap-4">
            <span className="text-red-400 w-20">{t.easterEggs.doom.health}</span>
            <span className="text-red-500 tracking-tighter">{"█".repeat(10)}</span>
            <span className="text-gray-600">200%</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-yellow-400 w-20">{t.easterEggs.doom.armor}</span>
            <span className="text-yellow-500 tracking-tighter">{"█".repeat(10)}</span>
            <span className="text-gray-600">200%</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-green-400 w-20">{t.easterEggs.doom.ammo}</span>
            <span className="text-green-500 tracking-tighter">{"█".repeat(10)}</span>
            <span className="text-gray-600">∞</span>
          </div>

          <p className="pt-6 text-gray-600 text-xs animate-pulse">
            {t.easterEggs.doom.continue}
          </p>
        </div>
      )}
    </div>
  );
}
