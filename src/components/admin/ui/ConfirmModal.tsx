"use client";

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ message, onConfirm, onCancel }: Readonly<ConfirmModalProps>) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="border border-border bg-surface p-6 max-w-sm w-full font-mono">
        <p className="text-text-primary text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 border border-red-400 text-red-400 py-1.5 text-sm hover:bg-red-400 hover:text-background transition-colors"
          >
            confirm
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-border text-muted py-1.5 text-sm hover:border-accent/40 hover:text-text-primary transition-colors"
          >
            cancel
          </button>
        </div>
      </div>
    </div>
  );
}
