"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";

// ── Constants ──────────────────────────────────────────────────────────────
const CLICKS_NEEDED = 5;
const WINDOW_MS     = 4000; // sliding window to reset if user stops

// Fire buffer dimensions (low-res, scaled up for pixel art look)
const FW = 160;
const FH = 90;

// Doom-style fire palette: black → dark red → red → orange → yellow → white
const PALETTE = (() => {
  const p = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    p[i * 4 + 0] = Math.min(255, i * 3);
    p[i * 4 + 1] = Math.min(255, Math.max(0, i * 3 - 255));
    p[i * 4 + 2] = Math.min(255, Math.max(0, i * 3 - 510));
    p[i * 4 + 3] = i > 6 ? Math.min(255, 155 + i) : 0;
  }
  return p;
})();

// ── Component ──────────────────────────────────────────────────────────────
export default function ThisIsFine() {
  const { t }  = useI18n();
  const [active,   setActive]   = useState(false);
  const [showDog,  setShowDog]  = useState(false);

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const fireRef      = useRef<Uint8Array>(new Uint8Array(FW * FH));
  const intensityRef = useRef(0);
  const rafRef       = useRef<number | null>(null);
  const clicksRef    = useRef<number[]>([]);

  // ── trigger: click nav links 5 times ──────────────────────────────────
  useEffect(() => {
    if (active) return;

    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('header a[href^="#"]');
      if (!link) return;

      const now = Date.now();
      clicksRef.current.push(now);
      clicksRef.current = clicksRef.current.filter(t => now - t < WINDOW_MS);

      if (clicksRef.current.length >= CLICKS_NEEDED) {
        clicksRef.current = [];
        setActive(true);
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [active]);

  // ── fire canvas ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;

    // Offscreen canvas for the fire buffer
    const off = document.createElement("canvas");
    off.width  = FW;
    off.height = FH;
    offscreenRef.current = off;
    const oc = off.getContext("2d")!;
    const imageData = oc.createImageData(FW, FH);
    const fire = fireRef.current;

    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Ramp up intensity over ~5 seconds
    const rampId = setInterval(() => {
      intensityRef.current = Math.min(255, intensityRef.current + 4);
    }, 80);

    // Show dog after 1.5s
    const dogTimer = setTimeout(() => setShowDog(true), 1500);

    const render = () => {
      // Seed bottom row
      const intensity = intensityRef.current;
      for (let x = 0; x < FW; x++) {
        const v = Math.max(0, Math.min(255, intensity + Math.floor(Math.random() * 40 - 20)));
        fire[(FH - 1) * FW + x] = v;
      }

      // Spread fire upward
      for (let y = 0; y < FH - 1; y++) {
        for (let x = 0; x < FW; x++) {
          const below      = fire[(y + 1) * FW + x];
          const belowLeft  = fire[(y + 1) * FW + ((x - 1 + FW) % FW)];
          const belowRight = fire[(y + 1) * FW + ((x + 1) % FW)];
          const same       = fire[y * FW + x];
          const avg = (below + belowLeft + belowRight + same) >> 2;
          fire[y * FW + x] = avg > 1 ? avg - 1 : 0;
        }
      }

      // Write to imageData
      const d = imageData.data;
      for (let i = 0; i < FW * FH; i++) {
        const v  = fire[i];
        const pi = v * 4;
        d[i * 4 + 0] = PALETTE[pi + 0];
        d[i * 4 + 1] = PALETTE[pi + 1];
        d[i * 4 + 2] = PALETTE[pi + 2];
        d[i * 4 + 3] = PALETTE[pi + 3];
      }
      oc.putImageData(imageData, 0, 0);

      // Draw scaled to main canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, canvas.width, canvas.height);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current!);
      clearInterval(rampId);
      clearTimeout(dogTimer);
      window.removeEventListener("resize", resize);
      // Reset fire state for next activation
      fireRef.current.fill(0);
      intensityRef.current = 0;
    };
  }, [active]);

  // ── dismiss ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const dismiss = () => { setActive(false); setShowDog(false); };
    const guard = setTimeout(() => {
      globalThis.addEventListener("keydown", dismiss, { once: true });
      globalThis.addEventListener("click",   dismiss, { once: true });
    }, 800);
    return () => {
      clearTimeout(guard);
      globalThis.removeEventListener("keydown", dismiss);
      globalThis.removeEventListener("click",   dismiss);
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      <style>{`
        @keyframes dog-appear {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes bubble-appear {
          from { transform: scale(0.6) translateY(8px); opacity: 0; }
          to   { transform: scale(1)   translateY(0);   opacity: 1; }
        }
        @keyframes caption-flicker {
          0%, 100% { opacity: 1; }
          45%      { opacity: 0.7; }
          50%      { opacity: 0.9; }
        }
        .dog-pop    { animation: dog-appear    0.4s ease-out both; }
        .bubble-pop { animation: bubble-appear 0.35s cubic-bezier(0.34,1.56,0.64,1) 0.2s both; }
        .caption-flicker { animation: caption-flicker 2.5s ease-in-out infinite; }
      `}</style>

      {/* Fire canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[998] pointer-events-none"
      />

      {/* Warm orange tint overlay */}
      <div className="fixed inset-0 z-[998] pointer-events-none bg-orange-950/30" />

      {/* Dog + speech bubble */}
      {showDog && (
        <div className="fixed bottom-24 left-10 z-[999] pointer-events-none dog-pop select-none">
          {/* Speech bubble */}
          <div className="bubble-pop relative mb-2 ml-2">
            <div className="bg-white text-black font-mono font-bold text-sm px-4 py-2 rounded-lg border-2 border-gray-800 shadow-lg whitespace-nowrap">
              {t.easterEggs.thisIsFine.fine}
            </div>
            {/* Bubble tail */}
            <div
              className="absolute left-5 -bottom-2 w-0 h-0"
              style={{
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "10px solid #1f2937",
              }}
            />
            <div
              className="absolute left-[21px] -bottom-[7px] w-0 h-0"
              style={{
                borderLeft: "7px solid transparent",
                borderRight: "7px solid transparent",
                borderTop: "9px solid white",
              }}
            />
          </div>

          {/* Dog at table */}
          <DogAtTable />
        </div>
      )}

      {/* Caption */}
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center pointer-events-none select-none">
        <p className="caption-flicker font-mono font-bold text-orange-300 text-xl tracking-widest drop-shadow-lg">
          {t.easterEggs.thisIsFine.caption}
        </p>
        <p className="text-orange-200/50 font-mono text-xs mt-6 animate-pulse tracking-widest">
          {t.easterEggs.thisIsFine.continue}
        </p>
      </div>
    </>
  );
}

function DogAtTable() {
  return (
    <svg viewBox="0 0 110 130" width="140" height="164" xmlns="http://www.w3.org/2000/svg">
      {/* Floppy ears (behind head) */}
      <ellipse cx="30" cy="52" rx="13" ry="18" fill="#C4904E" />
      <ellipse cx="80" cy="52" rx="13" ry="18" fill="#C4904E" />
      <ellipse cx="30" cy="54" rx="7" ry="11" fill="#D4A86A" opacity="0.5" />
      <ellipse cx="80" cy="54" rx="7" ry="11" fill="#D4A86A" opacity="0.5" />

      {/* Head */}
      <circle cx="55" cy="48" r="28" fill="#D4A86A" />

      {/* Eyes — calm/content (slightly squinting) */}
      <ellipse cx="45" cy="44" rx="5" ry="4" fill="white" />
      <ellipse cx="65" cy="44" rx="5" ry="4" fill="white" />
      <circle cx="45" cy="45" r="3" fill="#2C1A10" />
      <circle cx="65" cy="45" r="3" fill="#2C1A10" />
      {/* Gleam */}
      <circle cx="46" cy="44" r="1" fill="white" />
      <circle cx="66" cy="44" r="1" fill="white" />

      {/* Muzzle */}
      <ellipse cx="55" cy="57" rx="11" ry="8" fill="#E8C080" />
      {/* Nose */}
      <ellipse cx="55" cy="52" rx="4" ry="3" fill="#5C3010" />
      {/* Smile */}
      <path d="M 49 59 Q 55 65 61 59" stroke="#7A4820" fill="none" strokeWidth="1.8" strokeLinecap="round" />

      {/* Body stub (visible above table) */}
      <rect x="36" y="72" width="38" height="16" rx="6" fill="#C4904E" />

      {/* Table top */}
      <rect x="2" y="88" width="106" height="9" rx="3" fill="#8B6F47" />
      {/* Table underline shadow */}
      <rect x="2" y="95" width="106" height="2" rx="1" fill="#6B5230" opacity="0.5" />
      {/* Table legs */}
      <rect x="8"  y="97" width="7" height="28" rx="2" fill="#7A6040" />
      <rect x="95" y="97" width="7" height="28" rx="2" fill="#7A6040" />

      {/* Coffee mug on table */}
      {/* Mug body */}
      <rect x="68" y="72" width="22" height="16" rx="3" fill="#F5F0E8" />
      {/* Coffee surface */}
      <rect x="69" y="73" width="20" height="5" rx="2" fill="#6B3A1F" />
      {/* Steam wisps */}
      <path d="M 74 71 Q 72 66 74 61" stroke="#ccc" fill="none" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M 80 71 Q 78 66 80 61" stroke="#ccc" fill="none" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      {/* Mug handle */}
      <path d="M 90 76 Q 97 76 97 80 Q 97 85 90 85" stroke="#D0C8B8" fill="none" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

