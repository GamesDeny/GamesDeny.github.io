import { getProjects, getExperience, getEducation, getLanguages, getRoadmapConfig } from "@/lib/data";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Languages from "@/components/sections/Languages";
import Roadmap from "@/components/sections/Roadmap";
import Contact from "@/components/sections/Contact";

export default async function Page() {
  const [projects, experience, education, languages, roadmap] = await Promise.all([
    getProjects(),
    getExperience(),
    getEducation(),
    getLanguages(),
    getRoadmapConfig(),
  ]);

  return (
    <>
      <Hero />
      <Projects projects={projects} />
      <Experience experience={experience} education={education} />
      <Languages languages={languages} />
      {roadmap.username && <Roadmap username={roadmap.username} />}
      <Contact />
    </>
  );
}
