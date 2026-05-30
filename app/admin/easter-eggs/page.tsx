import { getEasterEggs } from "@/lib/data";
import EasterEggsClient from "./EasterEggsClient";

export default async function EasterEggsPage() {
  const config = await getEasterEggs();
  return <EasterEggsClient initial={config} />;
}
