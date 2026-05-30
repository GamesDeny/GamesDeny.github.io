import { getExperience, getEducation, getLanguages, getSkills } from "@/lib/data";
import { availableLocales } from "@/i18n";
import ExperienceClient from "./ExperienceClient";

export default async function ExperiencePage() {
  const [experience, education, languages, skills] = await Promise.all([
    getExperience(),
    getEducation(),
    getLanguages(),
    getSkills(),
  ]);

  const allTags = Array.from(
    new Set([...languages.map((l) => l.name), ...skills.map((s) => s.name)])
  ).sort((a, b) => a.localeCompare(b));

  return (
    <ExperienceClient
      initialExperience={experience}
      initialEducation={education}
      locales={availableLocales}
      allTags={allTags}
    />
  );
}
