"use client";

import { useEffect, useState } from "react";
import { useI18n, type Locale } from "@/i18n";
import { siteConfig } from "@/config/contact";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = ["hero", "projects", "experience", "languages", "contact"] as const;
type Section = (typeof SECTIONS)[number];

export default function Navbar() {
  const { t, locale, setLocale } = useI18n();
  const [active, setActive] = useState<Section>("hero");
  const [menuOpen, setMenuOpen] = useState(false);

  // Active section detection
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const navLabels: Record<Section, string> = {
    hero: t.nav.about,
    projects: t.nav.projects,
    experience: t.nav.experience,
    languages: t.nav.languages,
    contact: t.nav.contact,
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {SECTIONS.map((id) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={onClick}
          className={cn(
            "font-mono text-sm transition-colors duration-200",
            active === id ? "text-accent" : "text-muted hover:text-text-primary"
          )}
        >
          {navLabels[id]}
        </a>
      ))}
    </>
  );

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto px-6 md:px-12 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="font-mono font-bold text-accent text-sm">
          {siteConfig.name}<span className="animate-[blink_1s_step-end_infinite]">_</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks />
          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === "en" ? "it" : ("en" as Locale))}
            className="font-mono text-xs border border-border px-2.5 py-1 text-muted hover:border-accent/40 hover:text-accent transition-colors duration-200"
          >
            {locale === "en" ? "IT" : "EN"}
          </button>
        </div>

        {/* Mobile: lang toggle + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setLocale(locale === "en" ? "it" : ("en" as Locale))}
            className="font-mono text-xs border border-border px-2 py-1 text-muted hover:border-accent/40 hover:text-accent transition-colors duration-200"
          >
            {locale === "en" ? "IT" : "EN"}
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="text-muted hover:text-text-primary transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 px-6 py-6 flex flex-col gap-5">
          <NavLinks onClick={() => setMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
