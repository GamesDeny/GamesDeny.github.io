/** A string that varies per locale. Keys are locale codes, e.g. { en: "Hello", it: "Ciao" } */
export type LocalizedString = Record<string, string>;

/** An array of strings that varies per locale. Keys are locale codes. */
export type LocalizedStringArray = Record<string, string[]>;

export interface Project {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
}

export interface WorkEntry {
  id?: string;
  company: string;
  role: LocalizedString;
  startDate: string;
  endDate: string | null; // null = "Present"
  location: string;
  bullets: LocalizedStringArray;
  skills?: string[];
}

export interface EducationEntry {
  id?: string;
  institution: string;
  degree: LocalizedString;
  field: LocalizedString;
  startDate: string;
  endDate: string;
  gpa?: string;
  notes?: LocalizedStringArray;
}

export type ProficiencyLevel = "Expert" | "Proficient" | "Familiar" | "Learning";

export interface Language {
  name: string;
  proficiency: ProficiencyLevel;
  percentage: number; // 0–100 for bar width
  iconPath?: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface RoadmapConfig {
  username: string;
}

export interface PersonalInfo {
  name: string;
  tagline: string;
  bio: string;
  email: string;
  resumeUrl: string;
  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}
