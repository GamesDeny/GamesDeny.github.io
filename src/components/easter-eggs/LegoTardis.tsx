"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const CLICKS_REQUIRED = 4;
const CLICK_WINDOW_MS = 800;

type Phase = "entering" | "stopped" | "exiting";

interface Props {
  enabled: boolean;
}

export default function LegoTardis({ enabled }: Props) {
  const [active, setActive]     = useState(false);
  const [phase, setPhase]       = useState<Phase>("entering");
  const [slideStyle, setSlide]  = useState<CSSProperties>({});
  const clickCountRef           = useRef(0);
  const clickTimerRef           = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── click detection on avatar ──────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;
    const el = document.getElementById("hero-avatar");
    if (!el) return;

    const handleClick = () => {
      clickCountRef.current += 1;

      if (clickCountRef.current >= CLICKS_REQUIRED) {
        clickCountRef.current = 0;
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
        setActive(true);
        return;
      }

      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, CLICK_WINDOW_MS);
    };

    el.addEventListener("click", handleClick);
    return () => el.removeEventListener("click", handleClick);
  }, [enabled]);

  // ── animation sequence ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;

    setPhase("entering");
    setSlide({ transform: "translateX(-320px)", transition: "none" });

    // frame skip so the "no transition" paint lands before we add the transition
    const rafId = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setSlide({
          transform: "translateX(calc(50vw - 100px))",
          transition: "transform 2.8s cubic-bezier(0.2, 0, 0.1, 1)",
        });
      })
    );

    const t1 = setTimeout(() => setPhase("stopped"), 2900);

    const t2 = setTimeout(() => {
      setPhase("exiting");
      setSlide({
        transform: "translateX(calc(100vw + 100px))",
        transition: "transform 2s ease-in",
      });
    }, 7500);

    const t3 = setTimeout(() => setActive(false), 9600);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      <style>{`
        @keyframes lego-wave {
          0%, 100% { transform: rotate(-55deg); }
          50%       { transform: rotate(-85deg); }
        }
        .lego-arm-wave {
          transform-box: fill-box;
          transform-origin: top center;
          animation: lego-wave 0.65s ease-in-out infinite;
        }
        .lego-arm-raised {
          transform-box: fill-box;
          transform-origin: top center;
          transform: rotate(-55deg);
        }
        @keyframes tardis-light {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        .tardis-light {
          animation: tardis-light 1.2s ease-in-out infinite;
        }
      `}</style>

      <div
        className="fixed bottom-0 left-0 z-[998] pointer-events-none flex items-end"
        style={slideStyle}
      >
        <TardisSvg />
        <DoctorSvg waving={phase === "stopped"} />
      </div>
    </>
  );
}

// ── TARDIS ─────────────────────────────────────────────────────────────────────
function TardisSvg() {
  return (
    <svg width="110" height="200" viewBox="0 0 110 200" xmlns="http://www.w3.org/2000/svg">
      {/* lamp */}
      <rect x="46" y="0" width="18" height="8" rx="3" fill="#FFFFAA" className="tardis-light" />
      <rect x="42" y="8" width="26" height="5" rx="1" fill="#CCCC88" />

      {/* "POLICE BOX" sign — white panel */}
      <rect x="2" y="13" width="106" height="20" rx="1" fill="#F5F5F5" />
      <text x="55" y="27" textAnchor="middle" fontSize="8.5" fill="#003B9F"
        fontFamily="monospace" fontWeight="bold" letterSpacing="1">POLICE BOX</text>

      {/* cornice */}
      <rect x="0" y="33" width="110" height="6" fill="#00277A" />

      {/* body */}
      <rect x="0" y="39" width="110" height="161" fill="#003B9F" />

      {/* centre divider */}
      <rect x="52" y="39" width="6" height="161" fill="#00277A" />

      {/* ── LEFT side ── */}
      {/* upper panel bg */}
      <rect x="3" y="43" width="47" height="60" rx="1" fill="#00277A" />
      {/* top window */}
      <rect x="7" y="47" width="39" height="25" rx="1" fill="#4499DD" />
      <rect x="25" y="47" width="2" height="25" fill="#00277A" />
      <rect x="7"  y="59" width="39" height="2"  fill="#00277A" />
      {/* bottom window */}
      <rect x="7" y="75" width="39" height="24" rx="1" fill="#4499DD" />
      <rect x="25" y="75" width="2" height="24" fill="#00277A" />
      <rect x="7"  y="86" width="39" height="2"  fill="#00277A" />

      {/* left door */}
      <rect x="3" y="107" width="47" height="89" rx="1" fill="#00277A" />
      <rect x="7" y="111" width="39" height="24" rx="1" fill="#4499DD" />
      <rect x="25" y="111" width="2" height="24" fill="#00277A" />
      <rect x="7"  y="122" width="39" height="2"  fill="#00277A" />
      {/* door handle */}
      <rect x="46" y="150" width="4" height="8" rx="2" fill="#AAAAAA" />

      {/* ── RIGHT side ── */}
      <rect x="60" y="43" width="47" height="60" rx="1" fill="#00277A" />
      <rect x="64" y="47" width="39" height="25" rx="1" fill="#4499DD" />
      <rect x="82" y="47" width="2" height="25" fill="#00277A" />
      <rect x="64"  y="59" width="39" height="2"  fill="#00277A" />
      <rect x="64" y="75" width="39" height="24" rx="1" fill="#4499DD" />
      <rect x="82" y="75" width="2" height="24" fill="#00277A" />
      <rect x="64"  y="86" width="39" height="2"  fill="#00277A" />

      <rect x="60" y="107" width="47" height="89" rx="1" fill="#00277A" />
      <rect x="64" y="111" width="39" height="24" rx="1" fill="#4499DD" />
      <rect x="82" y="111" width="2" height="24" fill="#00277A" />
      <rect x="64"  y="122" width="39" height="2"  fill="#00277A" />
      <rect x="60" y="150" width="4" height="8" rx="2" fill="#AAAAAA" />

      {/* base step */}
      <rect x="0" y="194" width="110" height="6" fill="#00277A" />
    </svg>
  );
}

// ── Doctor Who minifigure ───────────────────────────────────────────────────
function DoctorSvg({ waving }: { waving: boolean }) {
  const armClass = waving ? "lego-arm-wave" : "lego-arm-raised";

  return (
    <svg width="56" height="108" viewBox="0 0 56 108" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      {/* HEAD */}
      <circle cx="28" cy="14" r="12" fill="#FFD700" />
      {/* eyes */}
      <ellipse cx="23" cy="12" rx="2.5" ry="3" fill="#333" />
      <ellipse cx="33" cy="12" rx="2.5" ry="3" fill="#333" />
      <circle cx="23" cy="11" r="1" fill="#fff" />
      <circle cx="33" cy="11" r="1" fill="#fff" />
      {/* smile */}
      <path d="M 22 19 Q 28 24 34 19" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* neck stud */}
      <rect x="24" y="26" width="8" height="6" rx="1" fill="#FFD700" />

      {/* TORSO — brown trench coat */}
      <rect x="13" y="32" width="30" height="28" rx="2" fill="#6B3A2A" />
      {/* shirt */}
      <rect x="23" y="34" width="10" height="24" fill="#F0EDE0" />
      {/* tie */}
      <polygon points="23,34 33,34 28,39" fill="#1565C0" />
      <rect x="25" y="39" width="6" height="18" fill="#1565C0" />

      {/* LEFT ARM — static, hanging */}
      <rect x="4" y="33" width="9" height="22" rx="2" fill="#6B3A2A" />
      <circle cx="8.5" cy="57" r="5.5" fill="#FFD700" />

      {/* RIGHT ARM — raised & waving */}
      {/* drawn straight down; CSS rotates it up around top-center */}
      <g className={armClass}>
        <rect x="43" y="33" width="9" height="22" rx="2" fill="#6B3A2A" />
        <circle cx="47.5" cy="57" r="5.5" fill="#FFD700" />
      </g>

      {/* HIPS */}
      <rect x="17" y="60" width="22" height="12" rx="1" fill="#1A237E" />

      {/* LEFT LEG */}
      <rect x="17" y="72" width="10" height="24" rx="1" fill="#1A237E" />
      <rect x="15" y="94" width="14" height="8" rx="2" fill="#212121" />

      {/* RIGHT LEG */}
      <rect x="29" y="72" width="10" height="24" rx="1" fill="#0D47A1" />
      <rect x="27" y="94" width="14" height="8" rx="2" fill="#212121" />
    </svg>
  );
}
