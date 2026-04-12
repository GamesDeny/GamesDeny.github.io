/**
 * Data access layer.
 *
 * All data fetching goes through these functions.
 * Currently backed by static TypeScript files in src/data/.
 *
 * To migrate to a database:
 *   1. Replace the import + return below with your DB query (e.g. Prisma, Drizzle, fetch)
 *   2. No component code needs to change — they all consume these functions.
 */

import type { Project, WorkEntry, EducationEntry, Language } from "@/types";

import _projects from "@/data/projects";
import _experience from "@/data/experience";
import _education from "@/data/education";
import _languages from "@/data/languages";

export async function getProjects(): Promise<Project[]> {
  return _projects;
}

export async function getExperience(): Promise<WorkEntry[]> {
  return _experience;
}

export async function getEducation(): Promise<EducationEntry[]> {
  return _education;
}

export async function getLanguages(): Promise<Language[]> {
  return _languages;
}
