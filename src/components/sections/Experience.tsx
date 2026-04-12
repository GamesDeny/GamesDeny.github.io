"use client";

import type { WorkEntry, EducationEntry } from "@/types";
import { useI18n } from "@/i18n";
import { localized, localizedArray } from "@/lib/i18n-utils";
import SectionTitle from "@/components/ui/SectionTitle";
import Badge from "@/components/ui/Badge";
import { getTechIcon } from "@/lib/tech-icons";

interface ExperienceProps {
  experience: WorkEntry[];
  education: EducationEntry[];
}

export default function Experience({ experience, education }: ExperienceProps) {
  const { t, locale } = useI18n();

  return (
    <section id="experience" className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto">
        <SectionTitle title={t.experience.title} subtitle={t.experience.subtitle} />

        {/* Work */}
        <h3 className="text-xs font-mono text-muted uppercase tracking-widest mb-8">
          {t.experience.work}
        </h3>
        <div className="relative border-l border-accent/20 pl-8 space-y-12 mb-16">
          {experience.map((entry, i) => (
            <div key={i} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[2.15rem] top-1.5 w-3 h-3 rounded-full border-2 border-accent bg-background" />

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-3">
                <div>
                  <h4 className="font-mono font-bold text-text-primary">
                    {localized(entry.role, locale)}
                  </h4>
                  <p className="font-mono text-accent text-sm">{entry.company}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-xs text-muted">
                    {entry.startDate} — {entry.endDate ?? t.experience.present}
                  </p>
                  <p className="font-mono text-xs text-muted">{entry.location}</p>
                </div>
              </div>

              <ul className="space-y-1.5 mb-4">
                {localizedArray(entry.bullets, locale).map((b, j) => (
                  <li key={j} className="font-mono text-sm text-text-secondary flex gap-2">
                    <span className="text-accent shrink-0">–</span>
                    {b}
                  </li>
                ))}
              </ul>

              {entry.skills && (
                <div className="flex flex-wrap gap-2">
                  {entry.skills.map((s) => {
                    const icon = getTechIcon(s);
                    return <Badge key={s} label={s} color={icon?.hex} />;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Education */}
        <h3 className="text-xs font-mono text-muted uppercase tracking-widest mb-8">
          {t.experience.education}
        </h3>
        <div className="relative border-l border-accent/20 pl-8 space-y-12">
          {education.map((entry, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[2.15rem] top-1.5 w-3 h-3 rounded-full border-2 border-accent bg-background" />

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                <div>
                  <h4 className="font-mono font-bold text-text-primary">
                    {localized(entry.degree, locale)} {localized(entry.field, locale)}
                  </h4>
                  <p className="font-mono text-accent text-sm">{entry.institution}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-xs text-muted">
                    {entry.startDate} — {entry.endDate}
                  </p>
                  {entry.gpa && (
                    <p className="font-mono text-xs text-muted">{entry.gpa}</p>
                  )}
                </div>
              </div>

              {entry.notes && (
                <ul className="space-y-1.5">
                  {localizedArray(entry.notes, locale).map((n, j) => (
                    <li key={j} className="font-mono text-sm text-text-secondary flex gap-2">
                      <span className="text-accent shrink-0">–</span>
                      {n}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
