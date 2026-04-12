"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";

// ── Constants ──────────────────────────────────────────────────────────────
const HOLD_MS = 2500;       // ms to hold Space to activate

const BPM  = 128;
const BEAT = 60 / BPM;     // 0.469 s per beat
const BAR  = BEAT * 4;     // 1.875 s per bar

// Note frequencies (Hz)
const N: Record<string, number> = {
  F2:  87.31, G2:  98.00,  A2: 110.00,
  C3: 130.81, E3: 164.81, F3: 174.61, G3: 196.00,
  A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
  A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 784.00,
  A5: 880.00,
};

// Chord progression: Am – F – C – G
const CHORDS: number[][] = [
  [N.A3, N.C4, N.E4],
  [N.F3, N.A3, N.C4],
  [N.C3, N.E3, N.G3],
  [N.G3, N.B3, N.D4],
];
const BASS_ROOTS = [N.A2, N.F2, N.C3, N.G2];
const ARPS: number[][] = [
  [N.A4, N.C5, N.E5, N.A5],
  [N.F4, N.A4, N.C5, N.F5],
  [N.C4, N.E4, N.G4, N.C5],
  [N.G4, N.B4, N.D5, N.G5],
];

// Matrix rain character pool (tech tags)
const POOL = "ReactTypeScriptNextGoDockerPostgresRedisKafkaJavaPythonAWSRustNodeSQLSpring".split("");

// ── Audio primitives ───────────────────────────────────────────────────────
function kick(ctx: AudioContext, out: AudioNode, t: number) {
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(0.001, t + 0.45);
  g.gain.setValueAtTime(0.95, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  osc.connect(g); g.connect(out);
  osc.start(t); osc.stop(t + 0.52);
}

function snare(ctx: AudioContext, out: AudioNode, t: number) {
  const sz   = Math.ceil(ctx.sampleRate * 0.18);
  const buf  = ctx.createBuffer(1, sz, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < sz; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 1200;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.65, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  noise.connect(hp); hp.connect(ng); ng.connect(out);
  noise.start(t); noise.stop(t + 0.2);

  const osc = ctx.createOscillator();
  const og  = ctx.createGain();
  osc.frequency.value = 185;
  og.gain.setValueAtTime(0.22, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc.connect(og); og.connect(out);
  osc.start(t); osc.stop(t + 0.1);
}

function hihat(ctx: AudioContext, out: AudioNode, t: number, open = false) {
  const dur  = open ? 0.28 : 0.04;
  const sz   = Math.ceil(ctx.sampleRate * dur);
  const buf  = ctx.createBuffer(1, sz, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < sz; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 8000;
  const g  = ctx.createGain();
  g.gain.setValueAtTime(open ? 0.22 : 0.18, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  noise.connect(hp); hp.connect(g); g.connect(out);
  noise.start(t); noise.stop(t + dur + 0.01);
}

function playBass(ctx: AudioContext, out: AudioNode, t: number, freq: number, dur: number) {
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = freq;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(900, t);
  lp.frequency.exponentialRampToValueAtTime(120, t + dur * 0.55);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.52, t);
  g.gain.setValueAtTime(0.52, t + dur * 0.82);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(lp); lp.connect(g); g.connect(out);
  osc.start(t); osc.stop(t + dur + 0.01);
}

function playPad(ctx: AudioContext, out: AudioNode, t: number, freq: number, dur: number) {
  for (const detune of [1, 1.006]) {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq * detune;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 1300; lp.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.05, t + BAR * 0.28);
    g.gain.setValueAtTime(0.05, t + dur * 0.75);
    g.gain.linearRampToValueAtTime(0, t + dur);
    osc.connect(lp); lp.connect(g); g.connect(out);
    osc.start(t); osc.stop(t + dur + 0.01);
  }
}

function playArp(ctx: AudioContext, out: AudioNode, t: number, freq: number, dur: number) {
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.value = freq;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass"; lp.frequency.value = 3200;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.09, t + 0.008);
  g.gain.setValueAtTime(0.09, t + dur * 0.68);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(lp); lp.connect(g); g.connect(out);
  osc.start(t); osc.stop(t + dur + 0.01);
}

function scheduleBar(ctx: AudioContext, out: AudioNode, barStart: number, barIdx: number) {
  const S    = BEAT / 2;   // 8th note duration
  const prog = barIdx % 4;

  // Drums
  kick(ctx, out, barStart);
  kick(ctx, out, barStart + BEAT * 2);
  snare(ctx, out, barStart + BEAT);
  snare(ctx, out, barStart + BEAT * 3);
  for (let i = 0; i < 8; i++) {
    hihat(ctx, out, barStart + S * i, i === 5);
  }

  // Pad chords (whole note)
  CHORDS[prog].forEach(f => playPad(ctx, out, barStart, f, BAR));

  // Bass (8th note pattern: root root fifth root fourth root fifth octave)
  const br = BASS_ROOTS[prog];
  [0, 0, 7, 0, 5, 0, 7, 12].forEach((semi, i) => {
    playBass(ctx, out, barStart + S * i, br * Math.pow(2, semi / 12), S * 0.88);
  });

  // Arp (8th notes cycling through chord tones)
  const notes = ARPS[prog];
  for (let i = 0; i < 8; i++) {
    playArp(ctx, out, barStart + S * i, notes[i % 4], S * 0.78);
  }
}

// ── Component ──────────────────────────────────────────────────────────────
export default function MatrixBoombox() {
  const { t } = useI18n();
  const [active,  setActive]  = useState(false);
  const [holding, setHolding] = useState(false);
  const [holdPct, setHoldPct] = useState(0);
  const [eqBars,  setEqBars]  = useState<number[]>(new Array(12).fill(0));

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number | null>(null);
  const schedRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartRef = useRef<number>(0);

  // ── hold-Space trigger ─────────────────────────────────────────────────
  useEffect(() => {
    if (active) return;

    const onDown = (e: KeyboardEvent) => {
      if (e.key !== " " || e.repeat) return;
      e.preventDefault();
      holdStartRef.current = Date.now();
      setHolding(true);
      holdTimerRef.current = setInterval(() => {
        const pct = Math.min((Date.now() - holdStartRef.current) / HOLD_MS, 1);
        setHoldPct(pct);
        if (pct >= 1) {
          clearInterval(holdTimerRef.current!);
          setHolding(false);
          setHoldPct(0);
          setActive(true);
        }
      }, 30);
    };

    const onUp = (e: KeyboardEvent) => {
      if (e.key !== " ") return;
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
      setHolding(false);
      setHoldPct(0);
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup",   onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup",   onUp);
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, [active]);

  // ── matrix rain ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");
    if (!c) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const FS   = 13;
    const cols = Math.floor(canvas.width / FS);
    const drops = new Float32Array(cols).map(() => Math.random() * -50);

    const id = setInterval(() => {
      c.fillStyle = "rgba(0,0,0,0.06)";
      c.fillRect(0, 0, canvas.width, canvas.height);
      c.font = `${FS}px 'JetBrains Mono', monospace`;
      for (let i = 0; i < cols; i++) {
        const ch = POOL[Math.floor(Math.random() * POOL.length)];
        c.fillStyle = Math.random() > 0.92 ? "#ffffff" : "#00ff9f";
        c.fillText(ch, i * FS, drops[i] * FS);
        if (drops[i] * FS > canvas.height && Math.random() > 0.97) drops[i] = 0;
        drops[i] += 0.55;
      }
    }, 40);

    return () => {
      clearInterval(id);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  // ── synthwave audio + EQ ───────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;

    const ctx    = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0.78;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    master.connect(analyser);
    analyser.connect(ctx.destination);

    ctx.resume().catch(() => {});

    let barIdx   = 0;
    let nextTime = ctx.currentTime + 0.05;
    const AHEAD  = BAR * 2;

    const advance = () => {
      while (nextTime < ctx.currentTime + AHEAD) {
        scheduleBar(ctx, master, nextTime, barIdx++);
        nextTime += BAR;
      }
    };

    advance();
    const schedId = setInterval(advance, 400);
    schedRef.current = schedId;

    // EQ animation loop
    const freq = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(freq);
      const bars = Array.from({ length: 12 }, (_, i) => {
        const lo  = Math.floor(i * freq.length / 12);
        const hi  = Math.floor((i + 1) * freq.length / 12);
        const avg = freq.slice(lo, hi).reduce((a, b) => a + b, 0) / Math.max(hi - lo, 1);
        return avg / 255;
      });
      setEqBars(bars);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      clearInterval(schedId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.close().catch(() => {});
    };
  }, [active]);

  // ── dismiss on any key/click ───────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const dismiss = () => setActive(false);
    const guard = setTimeout(() => {
      window.addEventListener("keydown", dismiss, { once: true });
      window.addEventListener("click",   dismiss, { once: true });
    }, 600);
    return () => {
      clearTimeout(guard);
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("click",   dismiss);
    };
  }, [active]);

  // ── hold progress bar (pre-activation) ────────────────────────────────
  if (!active) {
    if (!holding) return null;
    return (
      <div className="fixed bottom-0 left-0 w-full h-0.5 z-[997] bg-surface pointer-events-none">
        <div
          className="h-full bg-accent"
          style={{ width: `${holdPct * 100}%`, transition: "none" }}
        />
      </div>
    );
  }

  return (
    <>
      {/* Matrix rain canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 z-[998] pointer-events-none" />

      {/* Boombox overlay */}
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center select-none">
        <div className="border-2 border-accent/70 bg-black/90 backdrop-blur-sm p-5 w-[480px] max-w-[94vw] font-mono">

          <p className="text-accent/40 text-[10px] tracking-widest mb-3">MATRIX AUDIO v1.0</p>

          {/* Speaker + Cassette + Speaker */}
          <div className="flex gap-3 mb-4">
            <SpeakerGrille />
            <div className="flex-1 border border-accent/30 bg-black/60 p-3">
              <div className="flex justify-around items-center mb-2">
                <Reel speed="2.4s" />
                <span className="text-accent/60 text-[11px] tracking-wider">▶ PLAY</span>
                <Reel speed="1.9s" />
              </div>
              <div className="h-px bg-accent/20 my-1" />
              <p className="text-accent/30 text-[9px] text-center tracking-widest mt-1">
                SYNTHWAVE TAPE Ⅰ
              </p>
            </div>
            <SpeakerGrille />
          </div>

          {/* EQ bars */}
          <div className="flex items-end gap-0.5 h-16 mb-3 border border-accent/20 bg-black/40 p-2">
            {eqBars.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-accent rounded-sm"
                style={{ height: `${Math.max(3, h * 48)}px`, opacity: 0.4 + h * 0.6 }}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center px-1 text-accent/50 text-sm">
            <div className="flex gap-3">
              {(["⏮", "◀◀", "▶", "■", "▶▶", "⏭"] as const).map((s) => (
                <span key={s} className={s === "▶" ? "text-accent" : ""}>{s}</span>
              ))}
            </div>
            <span className="text-red-500/60 text-[10px] tracking-wider">● REC</span>
          </div>
        </div>

        <p className="text-accent/40 text-xs mt-4 animate-pulse tracking-widest">
          {t.easterEggs.music.stop}
        </p>
      </div>
    </>
  );
}

function SpeakerGrille() {
  return (
    <div className="w-[68px] shrink-0 border border-accent/30 bg-black/60 p-2">
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-accent/35" />
        ))}
      </div>
    </div>
  );
}

function Reel({ speed }: { speed: string }) {
  return (
    <div
      className="w-9 h-9 rounded-full border-2 border-accent/60 flex items-center justify-center animate-spin"
      style={{ animationDuration: speed }}
    >
      <div className="w-3 h-3 rounded-full border border-accent/35 flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-accent/50" />
      </div>
    </div>
  );
}
