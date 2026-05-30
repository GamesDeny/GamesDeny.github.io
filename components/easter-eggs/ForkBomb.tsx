"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";

const TRIGGER = ":(){ :|:& };:";

type Phase = "spawning" | "panic" | "joke";

export default function ForkBomb() {
  const { t } = useI18n();
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("spawning");
  const [lines, setLines] = useState<string[]>([]);
  const bufRef = useRef("");
  const pidRef = useRef(1000);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── trigger listener (inactive only) ──────────────────────────────────────
  useEffect(() => {
    if (active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.length > 1 && e.key !== " ") return;
      bufRef.current += e.key;
      if (bufRef.current.length > TRIGGER.length * 2) {
        bufRef.current = bufRef.current.slice(-TRIGGER.length * 2);
      }
      if (bufRef.current.endsWith(TRIGGER)) {
        bufRef.current = "";
        pidRef.current = 1337 + Math.floor(Math.random() * 1000);
        setLines([]);
        setPhase("spawning");
        setActive(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  // ── spawning phase ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active || phase !== "spawning") return;
    const MAX_LINES = 30;
    let count = 0;
    let delay = 160;
    let timer: ReturnType<typeof setTimeout>;

    const spawn = () => {
      if (count >= MAX_LINES) {
        setPhase("panic");
        return;
      }
      const parent = pidRef.current++;
      const child = pidRef.current++;
      setLines((prev) => [...prev, `[${parent}] fork() → [${child}] spawned`]);
      count++;
      delay = Math.max(16, delay * 0.83);
      timer = setTimeout(spawn, delay);
    };

    timer = setTimeout(spawn, 500);
    return () => clearTimeout(timer);
  }, [active, phase]);

  // ── panic → joke ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "panic") return;
    const timer = setTimeout(() => setPhase("joke"), 2000);
    return () => clearTimeout(timer);
  }, [phase]);

  // ── dismiss on any key during joke phase ───────────────────────────────────
  useEffect(() => {
    if (!active || phase !== "joke") return;
    const dismiss = () => {
      setActive(false);
      setLines([]);
      setPhase("spawning");
    };
    const timer = setTimeout(() => {
      window.addEventListener("keydown", dismiss, { once: true });
    }, 400);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", dismiss);
    };
  }, [active, phase]);

  // ── auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [lines]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-background font-mono flex flex-col p-6 md:p-16 overflow-hidden">
      <p className="text-sm mb-6 shrink-0">
        <span className="text-muted">user@portfolio:~$ </span>
        <span className="text-accent">{":(){ :|:& };:"}</span>
      </p>

      <div className="flex-1 overflow-y-auto mb-4" style={{ scrollbarWidth: "none" }}>
        {lines.map((line, i) => (
          <p key={i} className="text-xs text-text-secondary leading-5">{line}</p>
        ))}
        <div ref={bottomRef} />
      </div>

      {(phase === "panic" || phase === "joke") && (
        <div className="shrink-0 border border-red-500/50 bg-red-500/5 p-4 mb-6 space-y-1">
          <p className="text-red-400 font-bold text-sm">{t.easterEggs.forkBomb.panic}</p>
          <p className="text-red-400/70 text-xs">{t.easterEggs.forkBomb.detail}</p>
          <p className="text-red-400/40 text-xs">{t.easterEggs.forkBomb.reboot}</p>
        </div>
      )}

      {phase === "joke" && (
        <div className="shrink-0 space-y-2">
          <p className="text-sm">
            <span className="text-muted">{">"} </span>
            <span className="text-accent">{t.easterEggs.forkBomb.joke}</span>
          </p>
          <p className="text-muted text-xs animate-pulse">{t.easterEggs.forkBomb.continue}</p>
        </div>
      )}
    </div>
  );
}
