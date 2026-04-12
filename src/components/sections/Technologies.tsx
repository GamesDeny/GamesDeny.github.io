"use client";

import type { WorkEntry } from "@/types";
import { getTechIcon } from "@/lib/tech-icons";
import SectionTitle from "@/components/ui/SectionTitle";

interface TechnologiesProps {
  experience: WorkEntry[];
}

interface TagEntry {
  name: string;
  count: number;
}

function TechIcon({ path, hex, size = 20 }: { path: string; hex: string; size?: number }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ fill: `#${hex}` }}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export default function Technologies({ experience }: TechnologiesProps) {
  // Count how many experience entries each tag appears in
  const countMap = new Map<string, number>();
  for (const entry of experience) {
    for (const skill of entry.skills ?? []) {
      countMap.set(skill, (countMap.get(skill) ?? 0) + 1);
    }
  }

  const tags: TagEntry[] = Array.from(countMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  if (tags.length === 0) return null;

  return (
    <section id="technologies" className="py-24 px-6 md:px-12 lg:px-24 bg-surface/30">
      <div className="max-w-5xl mx-auto">
        <SectionTitle title="technologies" subtitle="Tools and frameworks I work with" />

        <div className="flex flex-wrap gap-3">
          {tags.map(({ name, count }) => {
            const icon = getTechIcon(name);
            return (
              <div
                key={name}
                title={`used in ${count} ${count === 1 ? "role" : "roles"}`}
                className="group flex items-center gap-2.5 border bg-surface px-4 py-2.5 font-mono text-sm transition-colors duration-200"
                style={
                  icon
                    ? {
                        borderColor: `#${icon.hex}60`,
                        color: `#${icon.hex}`,
                        backgroundColor: `#${icon.hex}0e`,
                      }
                    : undefined
                }
              >
                {icon ? (
                  <TechIcon path={icon.path} hex={icon.hex} size={18} />
                ) : (
                  <span className="w-[18px] h-[18px] flex items-center justify-center text-xs text-muted border border-border shrink-0">
                    {name[0].toUpperCase()}
                  </span>
                )}
                {name}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
