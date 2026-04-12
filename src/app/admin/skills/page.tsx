import { getSkills } from "@/lib/data";
import SkillsClient from "./SkillsClient";

export default async function SkillsPage() {
  const skills = await getSkills();
  return <SkillsClient initial={skills} />;
}
