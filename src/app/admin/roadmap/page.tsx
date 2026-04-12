import { getRoadmapConfig } from "@/lib/data";
import RoadmapClient from "./RoadmapClient";

export default async function RoadmapPage() {
  const config = await getRoadmapConfig();
  return <RoadmapClient initial={config} />;
}
