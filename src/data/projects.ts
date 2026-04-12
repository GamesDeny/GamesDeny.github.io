import type { Project } from "@/types";

/**
 * Projects data.
 * To migrate to a DB: replace this array with a fetch call in src/lib/data.ts.
 * Each project should match the Project interface.
 */
const projects: Project[] = [
  {
    id: "project-one",
    name: "project-one",
    description:
      "A brief description of what this project does and the problem it solves.",
    techStack: ["TypeScript", "Node.js", "PostgreSQL", "Docker"],
    githubUrl: "https://github.com/yourhandle/project-one",
    liveUrl: "https://project-one.vercel.app",
    featured: true,
  },
  {
    id: "project-two",
    name: "project-two",
    description:
      "Another project description. What makes it interesting, what you learned.",
    techStack: ["Python", "FastAPI", "Redis"],
    githubUrl: "https://github.com/yourhandle/project-two",
    featured: false,
  },
  {
    id: "project-three",
    name: "project-three",
    description: "A third project. Keep descriptions concise and punchy.",
    techStack: ["Go", "gRPC", "Kubernetes"],
    githubUrl: "https://github.com/yourhandle/project-three",
    liveUrl: "https://project-three.example.com",
    featured: false,
  },
];

export default projects;
