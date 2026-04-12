import { cn } from "@/lib/utils";

interface TerminalPromptProps {
  text: string;
  className?: string;
}

export default function TerminalPrompt({ text, className }: TerminalPromptProps) {
  return (
    <span className={cn("font-mono", className)}>
      <span className="text-accent">&gt; </span>
      <span className="text-text-primary">{text}</span>
    </span>
  );
}
