import { getProjects, getExperience, getEducation, getLanguages } from "@/lib/data";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Languages from "@/components/sections/Languages";
import Contact from "@/components/sections/Contact";

export default async function Page() {
  const [projects, experience, education, languages] = await Promise.all([
    getProjects(),
    getExperience(),
    getEducation(),
    getLanguages(),
  ]);

  return (
    <>
      <Hero />
      <Projects projects={projects} />
      <Experience experience={experience} education={education} />
      <Languages languages={languages} />
      <Contact />
    </>
  );
}
