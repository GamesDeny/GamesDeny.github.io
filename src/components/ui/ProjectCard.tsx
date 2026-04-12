"use client";

import type { Project } from "@/types";
import { useI18n } from "@/i18n";
import Badge from "./Badge";
import { GitFork, ExternalLink } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { t } = useI18n();

  return (
    <div className="group relative flex flex-col border border-border bg-surface p-6 hover:border-accent/40 hover:-translate-y-1 transition-all duration-200">
      {/* Featured pill */}
      {project.featured && (
        <span className="absolute top-4 right-4 text-xs font-mono text-accent border border-accent/40 px-2 py-0.5">
          {t.projects.featured}
        </span>
      )}

      {/* Name */}
      <h3 className="font-mono font-bold text-accent text-lg mb-2">
        {project.name}
      </h3>

      {/* Description */}
      <p className="font-mono text-sm text-text-secondary leading-relaxed flex-1 mb-4">
        {project.description}
      </p>

      {/* Tech stack */}
      <div className="flex flex-wrap gap-2 mb-6">
        {project.techStack.map((tech) => (
          <Badge key={tech} label={tech} />
        ))}
      </div>

      {/* Links */}
      <div className="flex gap-4 mt-auto">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono text-muted hover:text-accent transition-colors duration-200"
          >
            <GitFork size={14} />
            {t.projects.github}
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono text-muted hover:text-accent transition-colors duration-200"
          >
            <ExternalLink size={14} />
            {t.projects.live}
          </a>
        )}
      </div>
    </div>
  );
}
