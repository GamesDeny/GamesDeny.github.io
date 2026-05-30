import { getLanguages } from "@/lib/data";
import LanguagesClient from "./LanguagesClient";

export default async function LanguagesPage() {
  const languages = await getLanguages();
  return <LanguagesClient initial={languages} />;
}
