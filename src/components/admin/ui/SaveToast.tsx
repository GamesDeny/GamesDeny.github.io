"use client";

import { useEffect } from "react";
import { Check, X } from "lucide-react";

interface SaveToastProps {
  message: string;
  type?: "success" | "error";
  onDismiss: () => void;
  offsetBottom?: boolean;
}

export default function SaveToast({ message, type = "success", onDismiss, offsetBottom }: SaveToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={`fixed ${offsetBottom ? "bottom-20" : "bottom-6"} right-6 flex items-center gap-2 border px-4 py-3 font-mono text-sm z-50 ${
      type === "success" ? "border-accent text-accent bg-surface" : "border-red-400 text-red-400 bg-surface"
    }`}>
      {type === "success" ? <Check size={14} /> : <X size={14} />}
      {message}
    </div>
  );
}
