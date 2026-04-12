"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { contact, siteConfig } from "@/config/contact";
import SectionTitle from "@/components/ui/SectionTitle";
import SocialLink from "@/components/ui/SocialLink";
import { GitFork, Link, Camera, Layers, Map, Mail, Copy, Check } from "lucide-react";

export default function Contact() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    if (!contact.email) return;
    await navigator.clipboard.writeText(contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roadmapUrl = siteConfig.roadmapUsername
    ? `https://roadmap.sh/u/${siteConfig.roadmapUsername}`
    : null;

  const socialLinks = [
    contact.social.github && { href: contact.social.github, label: "GitHub", icon: <GitFork size={16} /> },
    contact.social.linkedin && { href: contact.social.linkedin, label: "LinkedIn", icon: <Link size={16} /> },
    contact.social.instagram && { href: contact.social.instagram, label: "Instagram", icon: <Camera size={16} /> },
    contact.social.stackoverflow && { href: contact.social.stackoverflow, label: "Stack Overflow", icon: <Layers size={16} /> },
    roadmapUrl && { href: roadmapUrl, label: "roadmap.sh", icon: <Map size={16} /> },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  return (
    <section id="contact" className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto">
        <SectionTitle title={t.contact.title} subtitle={t.contact.subtitle} />

        {/* Terminal box */}
        <div className="border border-border bg-surface p-8 font-mono">
          {/* Email */}
          {contact.email && (
            <div className="flex items-center gap-4 mb-8">
              <Mail size={16} className="text-accent shrink-0" />
              <span className="text-text-primary text-sm">{contact.email}</span>
              <button
                onClick={copyEmail}
                className="ml-auto flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors duration-200 border border-border px-3 py-1.5 hover:border-accent/40"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? t.contact.copied : t.contact.copy_email}
              </button>
            </div>
          )}

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div>
              <p className="text-xs text-muted mb-4">{t.contact.find_me}</p>
              <div className="flex flex-wrap gap-6">
                {socialLinks.map((link) => (
                  <SocialLink key={link.label} {...link} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
