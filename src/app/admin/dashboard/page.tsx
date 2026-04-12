import { getProjects, getExperience, getEducation, getLanguages } from "@/lib/data";
import { FolderGit, Briefcase, GraduationCap, Code2 } from "lucide-react";

export default async function DashboardPage() {
  const [projects, experience, education, languages] = await Promise.all([
    getProjects(), getExperience(), getEducation(), getLanguages(),
  ]);

  const stats = [
    { label: "projects",   count: projects.length,   icon: FolderGit,      href: "/admin/projects" },
    { label: "jobs",       count: experience.length,  icon: Briefcase,      href: "/admin/experience" },
    { label: "education",  count: education.length,   icon: GraduationCap,  href: "/admin/experience" },
    { label: "languages",  count: languages.length,   icon: Code2,          href: "/admin/languages" },
  ];

  return (
    <div>
      <p className="text-accent text-sm mb-1">&gt; admin</p>
      <h1 className="text-2xl font-bold text-text-primary mb-8">dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, count, icon: Icon, href }) => (
          <a
            key={label}
            href={href}
            className="border border-border bg-surface p-5 hover:border-accent/40 transition-colors duration-150 group"
          >
            <Icon size={18} className="text-muted mb-3 group-hover:text-accent transition-colors" />
            <p className="text-3xl font-bold text-accent mb-1">{count}</p>
            <p className="text-xs text-muted">{label}</p>
          </a>
        ))}
      </div>

      <div className="mt-10 border border-border bg-surface p-5 font-mono text-xs text-muted space-y-1">
        <p><span className="text-accent">&gt;</span> data is stored in <span className="text-text-primary">content/*.json</span></p>
        <p><span className="text-accent">&gt;</span> changes take effect immediately on the public site</p>
        <p><span className="text-accent">&gt;</span> set <span className="text-text-primary">ADMIN_PASSWORD</span> in .env.local before exposing to network</p>
      </div>
    </div>
  );
}
