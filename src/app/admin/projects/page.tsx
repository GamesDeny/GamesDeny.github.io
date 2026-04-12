import { getProjects } from "@/lib/data";
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsClient initial={projects} />;
}
