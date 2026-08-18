import {
  getProjects,
  getExperience,
  getEducation,
  getLanguages,
  getEasterEggs,
} from "@/lib/data";
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
import { siteConfig, contact } from "@/config/contact";

export default async function Page() {
  const [projects, experience, education, languages, easterEggs] =
    await Promise.all([
      getProjects(),
      getExperience(),
      getEducation(),
      getLanguages(),
      getEasterEggs(),
    ]);

  return (
    <>
      <Hero
        siteName={siteConfig.name}
        isAvatarLocal={siteConfig.isAvatarLocal}
        avatarPath={siteConfig.avatarPath}
        avatarUrl={siteConfig.avatarUrl}
        doomModeEnabled={easterEggs.doomMode}
        legoTardisEnabled={easterEggs.legoTardis}
      />
      <Projects projects={projects} />
      <Experience experience={experience} education={education} />
      <Languages languages={languages} />
      <Technologies experience={experience} />
      <Contact
        email={contact.email}
        github={contact.social.github}
        linkedin={contact.social.linkedin}
        instagram={contact.social.instagram}
        stackoverflow={contact.social.stackoverflow}
        leetcode={contact.social.leetcode}
        roadmapUsername={siteConfig.roadmapUsername}
      />
      {easterEggs.forkBomb && <ForkBomb />}
      {easterEggs.cookingTimer && <CookingTimer />}
      {easterEggs.musicMode && <MatrixBoombox />}
      {easterEggs.thisIsFine && <ThisIsFine />}
    </>
  );
}
