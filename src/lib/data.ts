import type { Project, WorkEntry, EducationEntry, Language, RoadmapConfig } from "@/types";
import { readJSON, contentPath } from "@/lib/admin/content";

import _projects from "@/data/projects";
import _experience from "@/data/experience";
import _education from "@/data/education";
import _languages from "@/data/languages";

export async function getProjects(): Promise<Project[]> {
  return readJSON<Project[]>(contentPath("projects.json"), _projects);
}

export async function getExperience(): Promise<WorkEntry[]> {
  return readJSON<WorkEntry[]>(contentPath("experience.json"), _experience);
}

export async function getEducation(): Promise<EducationEntry[]> {
  return readJSON<EducationEntry[]>(contentPath("education.json"), _education);
}

export async function getLanguages(): Promise<Language[]> {
  return readJSON<Language[]>(contentPath("languages.json"), _languages);
}

export async function getRoadmapConfig(): Promise<RoadmapConfig> {
  return readJSON<RoadmapConfig>(contentPath("roadmap.json"), { username: "" });
}
