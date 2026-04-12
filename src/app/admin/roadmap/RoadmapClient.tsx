"use client";

import { useState } from "react";
import type { RoadmapConfig } from "@/types";
import SaveToast from "@/components/admin/ui/SaveToast";
import { ExternalLink } from "lucide-react";

export default function RoadmapClient({ initial }: { initial: RoadmapConfig }) {
  const [username, setUsername] = useState(initial.username);
  const [preview, setPreview] = useState(!!initial.username);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const profileUrl = `https://roadmap.sh/u/${username}`;

  const save = async () => {
    const res = await fetch("/api/admin/roadmap", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    setToast(res.ok ? { msg: "roadmap config saved", type: "success" } : { msg: "save failed", type: "error" });
  };

  return (
    <div>
      <p className="text-accent text-sm mb-1">&gt; admin / roadmap</p>
      <h1 className="text-2xl font-bold text-text-primary mb-8">roadmap.sh</h1>

      <div className="max-w-lg space-y-6">
        <div>
          <label className="block text-xs text-muted font-mono mb-1">roadmap.sh username</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourusername"
              className="flex-1 bg-background border border-border px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
            />
            <button onClick={save} className="border border-accent text-accent px-4 py-2 text-sm font-mono hover:bg-accent hover:text-background transition-colors">
              save
            </button>
          </div>
        </div>

        {username && (
          <div className="flex items-center gap-4">
            <a href={profileUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-mono text-accent hover:underline">
              <ExternalLink size={13} /> view profile
            </a>
            <button onClick={() => setPreview((p) => !p)} className="text-xs text-muted font-mono hover:text-text-primary transition-colors">
              {preview ? "hide preview" : "show preview"}
            </button>
          </div>
        )}

        {username && preview && (
          <div className="border border-border">
            <iframe
              src={profileUrl}
              title="roadmap.sh profile"
              className="w-full h-[600px]"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}

        <div className="border border-border bg-surface p-4 font-mono text-xs text-muted space-y-1">
          <p><span className="text-accent">&gt;</span> the username is saved to <span className="text-text-primary">content/roadmap.json</span></p>
          <p><span className="text-accent">&gt;</span> the public portfolio will show your profile embed if a username is set</p>
          <p><span className="text-accent">&gt;</span> leave empty to hide the roadmap section entirely</p>
        </div>
      </div>

      {toast && <SaveToast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
