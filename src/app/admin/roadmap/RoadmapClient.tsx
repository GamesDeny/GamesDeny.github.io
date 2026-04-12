"use client";

import { useState } from "react";
import type { RoadmapConfig } from "@/types";
import { ExternalLink } from "lucide-react";

export default function RoadmapClient({ initial }: { initial: RoadmapConfig }) {
  const { username } = initial;
  const [preview, setPreview] = useState(!!username);
  const profileUrl = `https://roadmap.sh/u/${username}`;

  return (
    <div>
      <p className="text-accent text-sm mb-1">&gt; admin / roadmap</p>
      <h1 className="text-2xl font-bold text-text-primary mb-8">roadmap.sh</h1>

      <div className="max-w-lg space-y-6">
        {/* Read-only display */}
        <div>
          <label className="block text-xs text-muted font-mono mb-1">roadmap.sh username</label>
          <div className="flex items-center gap-3 border border-border bg-surface px-3 py-2">
            <span className="flex-1 text-sm font-mono text-text-primary">{username || "—"}</span>
            <span className="text-xs font-mono text-muted border border-border px-2 py-0.5">env</span>
          </div>
        </div>

        <div className="border border-border bg-surface p-4 font-mono text-xs text-muted space-y-1">
          <p><span className="text-accent">&gt;</span> configured via <span className="text-text-primary">NEXT_PUBLIC_ROADMAP_USERNAME</span> in .env.local</p>
          <p><span className="text-accent">&gt;</span> the roadmap section is visible on the public site when the variable is set</p>
          <p><span className="text-accent">&gt;</span> leave empty to hide the section entirely</p>
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
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface">
              <span className="font-mono text-xs text-muted">roadmap.sh/u/{username}</span>
            </div>
            <iframe
              src={profileUrl}
              title="roadmap.sh profile"
              className="w-full h-[600px]"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}
      </div>
    </div>
  );
}
