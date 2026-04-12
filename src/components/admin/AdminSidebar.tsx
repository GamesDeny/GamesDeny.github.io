"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FolderGit, Briefcase, Code2, Wrench, Languages, LogOut,
} from "lucide-react";

const links = [
  { href: "/admin/dashboard",  label: "dashboard",   icon: LayoutDashboard },
  { href: "/admin/projects",   label: "projects",    icon: FolderGit },
  { href: "/admin/experience", label: "experience",  icon: Briefcase },
  { href: "/admin/languages",  label: "languages",   icon: Code2 },
  { href: "/admin/skills",     label: "skills",      icon: Wrench },
  { href: "/admin/i18n",       label: "i18n",        icon: Languages },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 border-r border-border bg-surface flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-border">
        <span className="font-mono font-bold text-accent text-sm">
          admin<span className="animate-[blink_1s_step-end_infinite]">_</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => (
          <a
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-5 py-2.5 font-mono text-sm transition-colors duration-150",
              pathname.startsWith(href)
                ? "text-accent bg-accent/10 border-r-2 border-accent"
                : "text-muted hover:text-text-primary hover:bg-border/30"
            )}
          >
            <Icon size={15} />
            {label}
          </a>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-border p-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full font-mono text-sm text-muted hover:text-red-400 transition-colors duration-150"
        >
          <LogOut size={15} />
          logout
        </button>
      </div>
    </aside>
  );
}
