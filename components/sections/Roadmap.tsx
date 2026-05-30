import SectionTitle from "@/components/ui/SectionTitle";
import { ExternalLink } from "lucide-react";

interface RoadmapProps {
  username: string;
}

export default function Roadmap({ username }: Readonly<RoadmapProps>) {
  if (!username) return null;

  const profileUrl = `https://roadmap.sh/u/${username}`;

  return (
    <section id="roadmap" className="py-24 px-6 md:px-12 lg:px-24 bg-surface/30">
      <div className="max-w-3xl mx-auto">
        <SectionTitle title="roadmap" subtitle="My learning journey on roadmap.sh" />
        <div className="border border-border">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface">
            <span className="font-mono text-xs text-muted">roadmap.sh/u/{username}</span>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-mono text-muted hover:text-accent transition-colors">
              <ExternalLink size={12} /> open
            </a>
          </div>
          <iframe
            src={profileUrl}
            title="roadmap.sh profile"
            className="w-full h-[600px]"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </section>
  );
}
