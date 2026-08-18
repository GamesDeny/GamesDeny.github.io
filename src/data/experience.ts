import type { WorkEntry } from "@/types";

const experience: WorkEntry[] = [
  {
    id: "acme-corp-senior-software-engineer",
    company: "Acme Corp",
    role: { en: "Senior Software Engineer", it: "Ingegnere Software Senior" },
    startDate: "Jan 2023",
    endDate: null,
    location: "Remote",
    bullets: {
      en: [
        "Built distributed event pipeline processing 10M+ events/day",
        "Led migration from REST to GraphQL, reducing over-fetching by 40%",
        "Mentored 3 junior engineers and led weekly architecture reviews",
      ],
      it: [
        "Costruito pipeline di eventi distribuita che elabora oltre 10M di eventi al giorno",
        "Guidato la migrazione da REST a GraphQL, riducendo l'over-fetching del 40%",
        "Mentoring di 3 ingegneri junior e conduzione di revisioni architetturali settimanali",
      ],
    },
    skills: ["TypeScript", "Kafka", "GraphQL", "AWS"],
  },
  {
    id: "startup-xyz-software-engineer",
    company: "Startup XYZ",
    role: { en: "Software Engineer", it: "Ingegnere Software" },
    startDate: "Mar 2021",
    endDate: "Dec 2022",
    location: "Milan, Italy",
    bullets: {
      en: [
        "Developed core API powering the main product used by 50k+ users",
        "Reduced p99 latency from 800ms to 120ms through query optimization",
      ],
      it: [
        "Sviluppato le API principali che alimentano il prodotto usato da oltre 50.000 utenti",
        "Ridotto la latenza p99 da 800ms a 120ms tramite ottimizzazione delle query",
      ],
    },
    skills: ["Python", "Django", "PostgreSQL", "Redis"],
  },
];

export default experience;
