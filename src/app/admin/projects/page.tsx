import { getProjects } from "@/lib/data";
import { availableLocales } from "@/i18n";
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsClient initial={projects} locales={availableLocales} />;
}
