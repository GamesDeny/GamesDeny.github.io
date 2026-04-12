"use client";

import { useEffect, useRef, useState } from "react";

interface SkillBarProps {
  percentage: number;
}

export default function SkillBar({ percentage }: SkillBarProps) {
  const [filled, setFilled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setFilled(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-1.5 w-full rounded-full bg-border overflow-hidden">
      <div
        className="h-full rounded-full bg-accent transition-all duration-1000 ease-out"
        style={{ width: filled ? `${percentage}%` : "0%" }}
      />
    </div>
  );
}
