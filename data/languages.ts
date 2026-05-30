import type { Language } from "@/types";

/**
 * Programming languages data.
 * percentage: 0–100, used for the animated bar width.
 * To migrate to a DB: replace this array with a fetch call in src/lib/data.ts.
 */
const languages: Language[] = [
  { name: "TypeScript", proficiency: "Expert",     percentage: 95 },
  { name: "Python",     proficiency: "Expert",     percentage: 90 },
  { name: "Go",         proficiency: "Proficient", percentage: 75 },
  { name: "SQL",        proficiency: "Proficient", percentage: 80 },
  { name: "Rust",       proficiency: "Familiar",   percentage: 45 },
  { name: "Java",       proficiency: "Familiar",   percentage: 50 },
];

export default languages;
