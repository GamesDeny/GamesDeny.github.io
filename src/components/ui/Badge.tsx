import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  variant?: "default" | "accent";
  className?: string;
}

export default function Badge({ label, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 text-xs font-mono rounded border",
        variant === "default"
          ? "bg-surface text-text-secondary border-border"
          : "bg-surface text-accent border-accent/40",
        className
      )}
    >
      {label}
    </span>
  );
}
