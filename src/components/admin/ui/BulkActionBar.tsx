"use client";

import { Pencil, Trash2, X } from "lucide-react";

interface BulkActionBarProps {
  count: number;
  onEdit: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export default function BulkActionBar({ count, onEdit, onDelete, onClear }: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-56 right-0 z-30 border-t border-accent/40 bg-background/95 backdrop-blur-md px-8 py-3 flex items-center justify-between font-mono">
      <span className="text-accent text-sm">{count} selected</span>
      <div className="flex items-center gap-3">
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 border border-border text-muted px-3 py-1.5 text-xs hover:border-accent/40 hover:text-text-primary transition-colors"
        >
          <X size={12} /> clear
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 border border-accent text-accent px-3 py-1.5 text-xs hover:bg-accent hover:text-background transition-colors"
        >
          <Pencil size={12} /> bulk edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 border border-red-400 text-red-400 px-3 py-1.5 text-xs hover:bg-red-400 hover:text-background transition-colors"
        >
          <Trash2 size={12} /> bulk delete
        </button>
      </div>
    </div>
  );
}
