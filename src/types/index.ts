export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
}

export interface WorkEntry {
  company: string;
  role: string;
  startDate: string;
  endDate: string | null; // null = "Present"
  location: string;
  bullets: string[];
  skills?: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  notes?: string[];
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
