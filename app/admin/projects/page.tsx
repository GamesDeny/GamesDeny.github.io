import { getProjects, getLanguages, getSkills } from "@/lib/data";
import { availableLocales } from "@/i18n";
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage() {
  const [projects, languages, skills] = await Promise.all([
    getProjects(),
    getLanguages(),
    getSkills(),
  ]);

  const allTags = Array.from(
    new Set([...languages.map((l) => l.name), ...skills.map((s) => s.name)])
  ).sort((a, b) => a.localeCompare(b));

  return <ProjectsClient initial={projects} locales={availableLocales} allTags={allTags} />;
}
