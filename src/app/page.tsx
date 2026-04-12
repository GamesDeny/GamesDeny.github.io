import { getProjects, getExperience, getEducation, getLanguages, getEasterEggs } from "@/lib/data";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Languages from "@/components/sections/Languages";
import Technologies from "@/components/sections/Technologies";
import Contact from "@/components/sections/Contact";
import ForkBomb from "@/components/easter-eggs/ForkBomb";
import CookingTimer from "@/components/easter-eggs/CookingTimer";
import MatrixBoombox from "@/components/easter-eggs/MatrixBoombox";
import ThisIsFine from "@/components/easter-eggs/ThisIsFine";

export default async function Page() {
  const [projects, experience, education, languages, easterEggs] = await Promise.all([
    getProjects(),
    getExperience(),
    getEducation(),
    getLanguages(),
    getEasterEggs(),
  ]);

  return (
    <>
      <Hero doomModeEnabled={easterEggs.doomMode} legoTardisEnabled={easterEggs.legoTardis} />
      <Projects projects={projects} />
      <Experience experience={experience} education={education} />
      <Languages languages={languages} />
      <Technologies experience={experience} />
      <Contact />
      {easterEggs.forkBomb && <ForkBomb />}
      {easterEggs.cookingTimer && <CookingTimer />}
      {easterEggs.musicMode && <MatrixBoombox />}
      {easterEggs.thisIsFine && <ThisIsFine />}
    </>
  );
}
