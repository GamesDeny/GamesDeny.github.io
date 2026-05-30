import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  variant?: "default" | "accent";
  className?: string;
  /** Brand hex color without '#'. When provided, overrides variant colors. */
  color?: string;
}

export default function Badge({ label, variant = "default", className, color }: Readonly<BadgeProps>) {
  let res = "";
  if(color) {
    switch(variant) {
      case "accent":
        res = "bg-surface text-accent border-accent/40";
        break;
      case "default":
      default:
        res = "bg-surface text-text-secondary border-border";
        break;
    }
  }

  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 text-xs font-mono rounded border",
        res,
        className
      )}
      style={
        color
          ? {
              borderColor: `#${color}70`,
              color: `#${color}`,
              backgroundColor: `#${color}12`,
            }
          : undefined
      }
    >
      {label}
    </span>
  );
}
