"use client";

import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/i18n";
import { ChevronDown } from "lucide-react";
import DoomMode from "@/components/easter-eggs/DoomMode";
import LegoTardis from "@/components/easter-eggs/LegoTardis";

interface HeroProps {
  siteName: string;
  isAvatarLocal: boolean;
  avatarPath: string;
  avatarUrl: string;
  doomModeEnabled?: boolean;
  legoTardisEnabled?: boolean;
}

export default function Hero({
  siteName,
  isAvatarLocal,
  avatarPath,
  avatarUrl,
  doomModeEnabled = false,
  legoTardisEnabled = false,
}: Readonly<HeroProps>) {
  const { t } = useI18n();
  const [imgError, setImgError] = useState(false);
  const avatarSrc = isAvatarLocal ? avatarPath : avatarUrl;
  const hasValidAvatar =
    typeof avatarSrc === "string" && avatarSrc.trim().length > 0;

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24"
    >
      <div className="max-w-6xl mx-auto w-full flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">
        {/* Left — text content */}
        <div className="flex-1">
          {/* Greeting */}
          <p className="text-muted font-mono text-sm mb-2">{t.hero.greeting}</p>

          {/* Name */}
          <h1
            id="hero-name"
            className="text-4xl md:text-6xl font-mono font-bold text-accent tracking-tight mb-4"
          >
            {siteName}
          </h1>
          <DoomMode enabled={doomModeEnabled} />
          <LegoTardis enabled={legoTardisEnabled} />

          {/* Tagline */}
          <h2 className="text-lg md:text-2xl font-mono text-text-secondary mb-8">
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

        {/* Right — photo */}
        <div
          id="hero-avatar"
          className="shrink-0 w-56 h-56 md:w-72 md:h-72 border border-accent/30 bg-surface relative overflow-hidden"
        >
          {imgError || !hasValidAvatar ? (
            <div className="w-full h-full flex items-center justify-center font-mono text-xs text-muted text-center px-4">
              image not available
            </div>
          ) : (
            <Image
              src={avatarSrc}
              alt={siteName}
              fill
              className="object-cover"
              onError={() => setImgError(true)}
              priority
            />
          )}
          {/* Accent corner decoration */}
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-accent" />
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-accent" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted animate-bounce">
        <ChevronDown size={20} />
      </div>
    </section>
  );
}
