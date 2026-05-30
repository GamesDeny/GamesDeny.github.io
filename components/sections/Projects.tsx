"use client";

import type { Project } from "@/types";
import { useI18n } from "@/i18n";
import SectionTitle from "@/components/ui/SectionTitle";
import ProjectCard from "@/components/ui/ProjectCard";

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: Readonly<ProjectsProps>) {
  const { t } = useI18n();

  return (
    <section id="projects" className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <SectionTitle title={t.projects.title} subtitle={t.projects.subtitle} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
