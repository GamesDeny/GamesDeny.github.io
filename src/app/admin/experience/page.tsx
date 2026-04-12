import { getExperience, getEducation } from "@/lib/data";
import ExperienceClient from "./ExperienceClient";

export default async function ExperiencePage() {
  const [experience, education] = await Promise.all([getExperience(), getEducation()]);
  return <ExperienceClient initialExperience={experience} initialEducation={education} />;
}
