"use client";

import type { WorkEntry } from "@/types";
import { useI18n } from "@/i18n";
import { localized } from "@/lib/i18n-utils";
import SectionTitle from "@/components/ui/SectionTitle";
import Badge from "@/components/ui/Badge";

interface TechnologiesProps {
  experience: WorkEntry[];
}

export default function Technologies({ experience }: TechnologiesProps) {
  const { locale } = useI18n();

  const byJob = experience
    .map((entry) => ({
      company: entry.company,
      role: localized(entry.role, locale),
      skills: entry.skills ?? [],
    }))
    .filter((entry) => entry.skills.length > 0);

  const allSkills = Array.from(
    new Set(experience.flatMap((e) => e.skills ?? []))
  ).sort((a, b) => a.localeCompare(b));

  if (allSkills.length === 0) return null;

  return (
    <section id="technologies" className="py-24 px-6 md:px-12 lg:px-24 bg-surface/30">
      <div className="max-w-5xl mx-auto">
        <SectionTitle title="technologies" subtitle="Skills from my work experience" />

        {byJob.length > 0 && (
          <div className="space-y-8 mb-14">
            {byJob.map((entry, i) => (
              <div key={i}>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-text-primary text-sm font-mono">{entry.company}</span>
                  <span className="text-muted text-xs font-mono">/ {entry.role}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.skills.map((skill) => (
                    <Badge key={skill} label={skill} variant="accent" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <p className="text-xs text-muted font-mono uppercase tracking-widest mb-4 border-b border-border pb-2">
            all technologies
          </p>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((skill) => (
              <Badge key={skill} label={skill} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
