import { siteConfig } from "@/config/contact";

export default function Footer() {
  return (
    <footer className="border-t border-border py-6 px-6 md:px-12">
      <p className="font-mono text-xs text-muted text-center">
        <span className="text-accent">©</span> {new Date().getFullYear()} {siteConfig.name}
      </p>
    </footer>
  );
}
