import type { Project, WorkEntry, EducationEntry, Language, Skill, RoadmapConfig, EasterEggsConfig } from "@/types";
import { readJSON, contentPath } from "@/lib/admin/content";
import { siteConfig } from "@/config/contact";

import _projects from "@/data/projects";
import _experience from "@/data/experience";
import _education from "@/data/education";
import _languages from "@/data/languages";
import _skills from "@/data/skills";

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

export async function getSkills(): Promise<Skill[]> {
  return readJSON<Skill[]>(contentPath("skills.json"), _skills);
}

export async function getRoadmapConfig(): Promise<RoadmapConfig> {
  return { username: siteConfig.roadmapUsername };
}

const _easterEggs: EasterEggsConfig = { forkBomb: true, doomMode: true, legoTardis: true, cookingTimer: true, musicMode: true, thisIsFine: true };

export async function getEasterEggs(): Promise<EasterEggsConfig> {
  return readJSON<EasterEggsConfig>(contentPath("easter-eggs.json"), _easterEggs);
}
