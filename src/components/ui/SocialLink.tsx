import { type ReactNode } from "react";

interface SocialLinkProps {
  href: string;
  label: string;
  icon: ReactNode;
}

export default function SocialLink({ href, label, icon }: Readonly<SocialLinkProps>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors duration-200 font-mono text-sm"
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
