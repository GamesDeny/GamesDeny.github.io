"use client";

import { useState } from "react";
import type { EasterEggsConfig } from "@/types";
import SaveToast from "@/components/admin/ui/SaveToast";

interface EggDef {
  key: keyof EasterEggsConfig;
  label: string;
  description: string;
  trigger: string;
}

const EGGS: EggDef[] = [
  {
    key: "forkBomb",
    label: "fork bomb",
    description: "Type the classic Unix fork bomb anywhere on the page to trigger a fake kernel panic.",
    trigger: "type  :(){ :|:& };:  anywhere",
  },
  {
    key: "doomMode",
    label: "doom mode",
    description: "Triple-click the blinking cursor after the name in the hero section to activate IDDQD god mode.",
    trigger: "4× click the name in the hero",
  },
  {
    key: "legoTardis",
    label: "lego tardis",
    description: "Click the avatar photo 4 times to summon a LEGO TARDIS sliding across the screen with Doctor Who waving.",
    trigger: "4× click the avatar photo",
  },
  {
    key: "cookingTimer",
    label: "cooking timer",
    description: "Move your mouse in 3 full circles to spin a pizza, twirl the screen, then countdown 3s before revealing pizza & spaghetti.",
    trigger: "3 full mouse circles (consistent direction)",
  },
  {
    key: "musicMode",
    label: "matrix boombox",
    description: "Hold Space for 2.5s to unleash matrix rain made of your tech stack with a retro boombox playing procedural synthwave (Web Audio API, no files).",
    trigger: "hold Space for 2.5 seconds",
  },
  {
    key: "thisIsFine",
    label: "this is fine",
    description: "Switch between sections 5 times in under 3 seconds to trigger a Doom-style fire rising from the bottom, the dog sitting calmly with his coffee.",
    trigger: "5 section switches within 3 seconds",
  },
];

export default function EasterEggsClient({ initial }: { initial: EasterEggsConfig }) {
  const [config, setConfig] = useState<EasterEggsConfig>(initial);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const toggle = async (key: keyof EasterEggsConfig) => {
    const next = { ...config, [key]: !config[key] };
    setConfig(next);
    setSaving(key);
    const res = await fetch("/api/admin/easter-eggs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: next[key] }),
    });
    setSaving(null);
    setToast(
      res.ok
        ? { msg: `${key} ${next[key] ? "enabled" : "disabled"}`, type: "success" }
        : { msg: "save failed", type: "error" }
    );
    if (!res.ok) setConfig(config); // revert on error
  };

  return (
    <div className="pb-16">
      <div className="mb-8">
        <p className="text-accent text-sm mb-1">&gt; admin / easter-eggs</p>
        <h1 className="text-2xl font-bold text-text-primary">easter eggs</h1>
      </div>

      <div className="space-y-3">
        {EGGS.map((egg) => {
          const enabled = config[egg.key];
          return (
            <div
              key={egg.key}
              className="border border-border bg-surface p-5 flex items-start justify-between gap-6"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-text-primary text-sm">{egg.label}</span>
                  <span
                    className={`text-xs font-mono px-2 py-0.5 border ${
                      enabled
                        ? "text-accent border-accent/40 bg-accent/5"
                        : "text-muted border-border"
                    }`}
                  >
                    {enabled ? "enabled" : "disabled"}
                  </span>
                </div>
                <p className="text-xs text-muted font-mono">{egg.description}</p>
                <p className="text-xs text-text-secondary font-mono mt-2">
                  <span className="text-muted">trigger: </span>
                  <span className="text-accent/80">{egg.trigger}</span>
                </p>
              </div>

              <button
                onClick={() => toggle(egg.key)}
                disabled={saving === egg.key}
                className={`shrink-0 w-11 h-6 rounded-full border transition-colors duration-200 relative disabled:opacity-40 ${
                  enabled
                    ? "bg-accent/20 border-accent/60"
                    : "bg-surface border-border"
                }`}
                aria-label={`${enabled ? "disable" : "enable"} ${egg.label}`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${
                    enabled
                      ? "left-[calc(100%-1.25rem)] bg-accent"
                      : "left-1 bg-muted"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {toast && (
        <SaveToast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}
