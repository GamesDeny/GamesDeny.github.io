import type { Project } from "@/types";

const projects: Project[] = [
  {
    id: "project-one",
    name: { en: "project-one", it: "project-one" },
    description: {
      en: "A brief description of what this project does and the problem it solves.",
      it: "Una breve descrizione di cosa fa questo progetto e del problema che risolve.",
    },
    techStack: ["TypeScript", "Node.js", "PostgreSQL", "Docker"],
    githubUrl: "https://github.com/yourhandle/project-one",
    liveUrl: "https://project-one.vercel.app",
    featured: true,
  },
  {
    id: "project-two",
    name: { en: "project-two", it: "project-two" },
    description: {
      en: "Another project description. What makes it interesting, what you learned.",
      it: "Un'altra descrizione di progetto. Cosa lo rende interessante, cosa hai imparato.",
    },
    techStack: ["Python", "FastAPI", "Redis"],
    githubUrl: "https://github.com/yourhandle/project-two",
    featured: false,
  },
  {
    id: "project-three",
    name: { en: "project-three", it: "project-three" },
    description: {
      en: "A third project. Keep descriptions concise and punchy.",
      it: "Un terzo progetto. Mantieni le descrizioni concise e incisive.",
    },
    techStack: ["Go", "gRPC", "Kubernetes"],
    githubUrl: "https://github.com/yourhandle/project-three",
    liveUrl: "https://project-three.example.com",
    featured: false,
  },
];

export default projects;
