"use client";

import { useI18n } from "@/i18n";
import { siteConfig } from "@/config/contact";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  const { t } = useI18n();

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24"
    >
      <div className="max-w-3xl">
        {/* Greeting */}
        <p className="text-muted font-mono text-sm mb-2">{t.hero.greeting}</p>

        {/* Name */}
        <h1 className="text-5xl md:text-7xl font-mono font-bold text-accent tracking-tight mb-4">
          {siteConfig.name}
        </h1>

        {/* Tagline */}
        <h2 className="text-xl md:text-2xl font-mono text-text-secondary mb-8">
          <span className="text-accent/60">{"// "}</span>
          {t.hero.tagline}
        </h2>

        {/* Bio */}
        <p className="text-text-secondary font-mono text-sm md:text-base leading-relaxed max-w-xl mb-12">
          {t.hero.bio}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <a
            href="#projects"
            className="px-6 py-2.5 border border-accent text-accent font-mono text-sm hover:bg-accent hover:text-background transition-colors duration-200"
          >
            {t.hero.cta_projects}
          </a>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 border border-border text-text-secondary font-mono text-sm hover:border-accent/50 hover:text-text-primary transition-colors duration-200"
          >
            {t.hero.cta_resume}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted animate-bounce">
        <ChevronDown size={20} />
      </div>
    </section>
  );
}
