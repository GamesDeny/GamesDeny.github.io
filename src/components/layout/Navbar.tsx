"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n, availableLocales } from "@/i18n";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  "hero",
  "projects",
  "experience",
  "languages",
  "technologies",
  "contact",
] as const;
type Section = (typeof SECTIONS)[number];

function LocaleDropdown() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 font-mono text-xs border border-border px-2.5 py-1 text-muted hover:border-accent/40 hover:text-accent transition-colors duration-200 uppercase"
      >
        {locale}
        <ChevronDown
          size={10}
          className={cn(
            "transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 border border-border bg-surface min-w-full z-50">
          {availableLocales.map((l) => (
            <button
              type="button"
              key={l}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className={cn(
                "block w-full text-left px-3 py-1.5 font-mono text-xs uppercase transition-colors duration-150",
                locale === l
                  ? "text-accent bg-accent/10"
                  : "text-muted hover:text-text-primary hover:bg-surface",
              )}
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar({ siteName }: Readonly<{ siteName: string }>) {
  const { t } = useI18n();
  const [active, setActive] = useState<Section>("hero");
  const [menuOpen, setMenuOpen] = useState(false);

  // Active section detection
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { threshold: 0.4 },
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
    technologies: t.nav.technologies,
    contact: t.nav.contact,
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto px-6 md:px-12 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="font-mono font-bold text-accent text-sm">
          {siteName}
          <span className="animate-[blink_1s_step-end_infinite]">_</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks active={active} navLabels={navLabels} />
          <LocaleDropdown />
        </div>

        {/* Mobile: lang toggle + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <LocaleDropdown />
          <button
            type="button"
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
          <NavLinks
            active={active}
            navLabels={navLabels}
            onClick={() => setMenuOpen(false)}
          />
        </div>
      )}
    </header>
  );
}

type NavLinksProps = {
  readonly active: Section;
  readonly navLabels: Record<Section, string>;
  readonly onClick?: () => void;
};

function NavLinks({ active, navLabels, onClick }: Readonly<NavLinksProps>) {
  return (
    <>
      {SECTIONS.map((id) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={onClick}
          className={cn(
            "font-mono text-sm transition-colors duration-200",
            active === id
              ? "text-accent"
              : "text-muted hover:text-text-primary",
          )}
        >
          {navLabels[id]}
        </a>
      ))}
    </>
  );
}
