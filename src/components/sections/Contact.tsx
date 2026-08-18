"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import SectionTitle from "@/components/ui/SectionTitle";
import SocialLink from "@/components/ui/SocialLink";
import {
  GitFork,
  Link,
  Camera,
  Layers,
  Map,
  Code2,
  Mail,
  Copy,
  Check,
} from "lucide-react";

interface ContactProps {
  email: string;
  github: string;
  linkedin: string;
  instagram: string;
  stackoverflow: string;
  leetcode: string;
  roadmapUsername: string;
}

export default function Contact({
  email,
  github,
  linkedin,
  instagram,
  stackoverflow,
  leetcode,
  roadmapUsername,
}: Readonly<ContactProps>) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    if (!email) return;
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roadmapUrl = roadmapUsername
    ? `https://roadmap.sh/u/${roadmapUsername}`
    : null;

  const socialLinks = [
    github && {
      href: github,
      label: "GitHub",
      icon: <GitFork size={16} />,
    },
    linkedin && {
      href: linkedin,
      label: "LinkedIn",
      icon: <Link size={16} />,
    },
    instagram && {
      href: instagram,
      label: "Instagram",
      icon: <Camera size={16} />,
    },
    stackoverflow && {
      href: stackoverflow,
      label: "Stack Overflow",
      icon: <Layers size={16} />,
    },
    roadmapUrl && {
      href: roadmapUrl,
      label: "roadmap.sh",
      icon: <Map size={16} />,
    },
    leetcode && {
      href: leetcode,
      label: "LeetCode",
      icon: <Code2 size={16} />,
    },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  const hasContent = email || socialLinks.length > 0;

  return (
    <section id="contact" className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto">
        <SectionTitle title={t.contact.title} subtitle={t.contact.subtitle} />

        {/* Terminal box */}
        <div className="border border-border bg-surface p-8 font-mono">
          {!hasContent ? (
            <p className="text-text-secondary text-sm">
              Contact information not configured.
            </p>
          ) : (
            <>
              {/* Email */}
              {email && (
                <div className="flex items-center gap-4 mb-8">
                  <Mail size={16} className="text-accent shrink-0" />
                  <span className="text-text-primary text-sm">
                    {email}
                  </span>
                  <button
                    type="button"
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
            </>
          )}
        </div>
      </div>
    </section>
  );
}
