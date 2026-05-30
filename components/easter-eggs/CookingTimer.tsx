"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";

const STEAM_FRAMES  = ["~ ~ ~", " ~ ~ ", "~ ~ ~", " ~ ~ "];
const SPINS_NEEDED  = 3;          // full mouse circles to complete
const RESET_MS      = 1500;       // reset progress if mouse idles

type Phase = "spinning" | "twirling" | "countdown" | "reveal";

export default function CookingTimer() {
  const { t } = useI18n();
  const [active, setActive]       = useState(false);
  const [phase, setPhase]         = useState<Phase>("spinning");
  const [countdown, setCountdown] = useState(3);
  const [steamIdx, setSteamIdx]   = useState(0);

  // mouse-spin tracking refs (no re-render needed)
  const accumulatedRef  = useRef(0);   // total radians turned (absolute)
  const directionRef    = useRef(0);   // +1 CW, -1 CCW, 0 undecided
  const lastAngleRef    = useRef<number | null>(null);
  const idleTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── trigger: 3 complete mouse circles ──────────────────────────────────────
  useEffect(() => {
    if (active) return;

    const resetSpin = () => {
      accumulatedRef.current = 0;
      directionRef.current   = 0;
      lastAngleRef.current   = null;
    };

    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);

      // restart idle timer
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(resetSpin, RESET_MS);

      if (lastAngleRef.current === null) {
        lastAngleRef.current = angle;
        return;
      }

      // shortest-arc delta in [-π, π]
      let delta = angle - lastAngleRef.current;
      if (delta >  Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;
      lastAngleRef.current = angle;

      if (Math.abs(delta) < 0.02) return; // ignore jitter

      const newDir = delta > 0 ? 1 : -1;

      // direction reversal → reset
      if (directionRef.current !== 0 && newDir !== directionRef.current) {
        resetSpin();
        return;
      }

      directionRef.current   = newDir;
      accumulatedRef.current += Math.abs(delta);

      if (accumulatedRef.current >= SPINS_NEEDED * 2 * Math.PI) {
        resetSpin();
        setPhase("spinning");
        setCountdown(3);
        setActive(true);
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [active]);

  // ── phase sequence ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;

    if (phase === "spinning") {
      const timer = setTimeout(() => setPhase("twirling"), 3000);
      return () => clearTimeout(timer);
    }

    if (phase === "twirling") {
      const timer = setTimeout(() => setPhase("countdown"), 900);
      return () => clearTimeout(timer);
    }

    if (phase === "countdown") {
      const steamTimer = setInterval(() => setSteamIdx(i => (i + 1) % 4), 280);
      let n = 3;
      const countTimer = setInterval(() => {
        n -= 1;
        setCountdown(n);
        if (n <= 0) {
          clearInterval(steamTimer);
          clearInterval(countTimer);
          setPhase("reveal");
        }
      }, 1000);
      return () => {
        clearInterval(steamTimer);
        clearInterval(countTimer);
      };
    }
  }, [active, phase]);

  // ── dismiss on reveal ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!active || phase !== "reveal") return;
    const dismiss = () => setActive(false);
    const timer = setTimeout(() => {
      window.addEventListener("keydown", dismiss, { once: true });
      window.addEventListener("click",   dismiss, { once: true });
    }, 600);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("click",   dismiss);
    };
  }, [active, phase]);

  if (!active) return null;

  const hour = new Date().getHours();
  const isBreakfast = hour >= 5  && hour < 12;
  const isLunch     = hour >= 12 && hour < 17;
  const meal =
    isBreakfast ? t.easterEggs.cooking.breakfast :
    isLunch     ? t.easterEggs.cooking.lunch     :
                  t.easterEggs.cooking.dinner;
  const foodEmoji = isBreakfast ? "☕" : isLunch ? "🍝" : "🍕";
  const foodLabel = isBreakfast ? "coffee" : isLunch ? "spaghetti" : "pizza";

  return (
    <>
      <style>{`
        @keyframes pizza-spin {
          from { transform: rotate(0deg);    }
          to   { transform: rotate(1080deg); }
        }
        @keyframes screen-twirl {
          0%   { transform: rotate(0deg)   scale(1);   }
          45%  { transform: rotate(180deg) scale(0.3); }
          100% { transform: rotate(360deg) scale(1);   }
        }
        @keyframes food-pop {
          0%   { transform: scale(0)   rotate(-15deg); opacity: 0; }
          65%  { transform: scale(1.2) rotate(5deg);  opacity: 1; }
          100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
        }
        @keyframes msg-rise {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .egg-pizza-spin { animation: pizza-spin 3s linear forwards; display: inline-block; }
        .egg-twirl      { animation: screen-twirl 0.9s ease-in-out forwards; }
        .egg-food-pop   { animation: food-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
        .egg-msg-rise   { animation: msg-rise 0.6s ease-out 0.5s both; }
      `}</style>

      <div className={`fixed inset-0 z-[999] bg-background font-mono flex flex-col items-center justify-center select-none${phase === "twirling" ? " egg-twirl" : ""}`}>

        {/* spinning + twirling */}
        {(phase === "spinning" || phase === "twirling") && (
          <div className="text-center">
            <span className={phase === "spinning" ? "egg-pizza-spin text-[8rem]" : "text-[8rem]"}>
              🍕
            </span>
            {phase === "spinning" && (
              <p className="text-muted text-sm mt-6 tracking-widest animate-pulse">
                mamma mia...
              </p>
            )}
          </div>
        )}

        {/* countdown */}
        {phase === "countdown" && (
          <div className="text-center">
            <p className="text-accent text-xl mb-3 h-7 tracking-widest">
              {STEAM_FRAMES[steamIdx]}
            </p>
            <div className="inline-block border-2 border-accent/50 rounded-lg px-14 py-6 mb-3">
              <span className="text-[7rem] font-bold text-accent leading-none tabular-nums">
                {countdown}
              </span>
            </div>
            <p className="text-2xl">🔥🔥🔥</p>
            <p className="text-muted text-xs mt-5 tracking-widest animate-pulse">cooking...</p>
          </div>
        )}

        {/* reveal */}
        {phase === "reveal" && (
          <div className="text-center space-y-10">
            <div className="egg-food-pop text-center">
              <div className="text-[7rem] leading-none" style={{ filter: "drop-shadow(0 0 12px rgba(255,220,100,0.6))" }}>{foodEmoji}</div>
              <p className="text-xs text-muted mt-3 tracking-widest">{foodLabel}</p>
            </div>

            <p className="egg-msg-rise text-accent text-lg font-bold tracking-wide">
              {t.easterEggs.cooking.ready.replace("{meal}", meal)}
            </p>

            <p className="text-muted text-xs animate-pulse">
              {t.easterEggs.cooking.continue}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
