import type { WorkEntry } from "@/types";

/**
 * Work experience data.
 * endDate: null means "Present".
 * To migrate to a DB: replace this array with a fetch call in src/lib/data.ts.
 */
const experience: WorkEntry[] = [
  {
    company: "Acme Corp",
    role: "Senior Software Engineer",
    startDate: "Jan 2023",
    endDate: null,
    location: "Remote",
    bullets: [
      "Built distributed event pipeline processing 10M+ events/day",
      "Led migration from REST to GraphQL, reducing over-fetching by 40%",
      "Mentored 3 junior engineers and led weekly architecture reviews",
    ],
    skills: ["TypeScript", "Kafka", "GraphQL", "AWS"],
  },
  {
    company: "Startup XYZ",
    role: "Software Engineer",
    startDate: "Mar 2021",
    endDate: "Dec 2022",
    location: "Milan, Italy",
    bullets: [
      "Developed core API powering the main product used by 50k+ users",
      "Reduced p99 latency from 800ms to 120ms through query optimization",
    ],
    skills: ["Python", "Django", "PostgreSQL", "Redis"],
  },
];

export default experience;
