"use client";

import type { Language } from "@/types";
import { useI18n } from "@/i18n";
import SectionTitle from "@/components/ui/SectionTitle";
import SkillBar from "@/components/ui/SkillBar";

interface LanguagesProps {
  languages: Language[];
}

const proficiencyColor: Record<string, string> = {
  Expert: "text-accent",
  Proficient: "text-accent/70",
  Familiar: "text-muted",
  Learning: "text-muted/60",
};

export default function Languages({ languages }: LanguagesProps) {
  const { t } = useI18n();

  const proficiencyLabel: Record<string, string> = {
    Expert: t.languages.expert,
    Proficient: t.languages.proficient,
    Familiar: t.languages.familiar,
    Learning: t.languages.learning,
  };

  return (
    <section id="languages" className="py-24 px-6 md:px-12 lg:px-24 bg-surface/30">
      <div className="max-w-3xl mx-auto">
        <SectionTitle title={t.languages.title} subtitle={t.languages.subtitle} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {languages.map((lang) => (
            <div key={lang.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-text-primary">{lang.name}</span>
                <span className={`font-mono text-xs ${proficiencyColor[lang.proficiency]}`}>
                  {proficiencyLabel[lang.proficiency]}
                </span>
              </div>
              <SkillBar percentage={lang.percentage} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
