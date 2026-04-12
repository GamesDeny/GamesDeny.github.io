"use client";

import { useState } from "react";
import type { Language, ProficiencyLevel } from "@/types";
import SkillBar from "@/components/ui/SkillBar";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import SaveToast from "@/components/admin/ui/SaveToast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const PROFICIENCY_LEVELS: ProficiencyLevel[] = ["Expert", "Proficient", "Familiar", "Learning"];
const EMPTY: Language = { name: "", proficiency: "Familiar", percentage: 50 };

export default function LanguagesClient({ initial }: { initial: Language[] }) {
  const [languages, setLanguages] = useState(initial);
  const [form, setForm] = useState<Language | null>(null);
  const [originalName, setOriginalName] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => setToast({ msg, type });

  const openNew = () => { setForm({ ...EMPTY }); setOriginalName(null); };
  const openEdit = (l: Language) => { setForm({ ...l }); setOriginalName(l.name); };

  const save = async () => {
    if (!form) return;
    const isEdit = originalName !== null;
    const res = await fetch("/api/admin/languages", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) return showToast("save failed", "error");
    const saved: Language = await res.json();
    setLanguages((prev) =>
      isEdit ? prev.map((l) => l.name === originalName ? saved : l) : [...prev, saved]
    );
    setForm(null);
    setOriginalName(null);
    showToast(isEdit ? "language updated" : "language added");
  };

  const confirmDelete = async () => {
    if (!deleteName) return;
    const res = await fetch(`/api/admin/languages?name=${encodeURIComponent(deleteName)}`, { method: "DELETE" });
    if (!res.ok) return showToast("delete failed", "error");
    setLanguages((prev) => prev.filter((l) => l.name !== deleteName));
    setDeleteName(null);
    showToast("language deleted");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-accent text-sm mb-1">&gt; admin / languages</p>
          <h1 className="text-2xl font-bold text-text-primary">languages</h1>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 border border-accent text-accent px-4 py-2 text-sm hover:bg-accent hover:text-background transition-colors">
          <Plus size={14} /> add language
        </button>
      </div>

      <div className="border border-border overflow-hidden">
        <table className="w-full text-sm font-mono">
          <thead className="bg-surface border-b border-border text-muted text-xs">
            <tr>
              <th className="text-left px-4 py-3">name</th>
              <th className="text-left px-4 py-3">proficiency</th>
              <th className="text-left px-4 py-3 w-48">bar</th>
              <th className="text-left px-4 py-3">%</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {languages.map((l) => (
              <tr key={l.name} className="border-b border-border hover:bg-surface/50">
                <td className="px-4 py-3 text-text-primary">{l.name}</td>
                <td className="px-4 py-3 text-muted text-xs">{l.proficiency}</td>
                <td className="px-4 py-3 w-48"><SkillBar percentage={l.percentage} /></td>
                <td className="px-4 py-3 text-accent text-xs">{l.percentage}%</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => openEdit(l)} className="text-muted hover:text-accent"><Pencil size={13} /></button>
                    <button onClick={() => setDeleteName(l.name)} className="text-muted hover:text-red-400"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {languages.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted text-xs">no languages yet</td></tr>}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6">
          <div className="bg-surface border border-border w-full max-w-sm p-6 font-mono">
            <h2 className="text-accent text-sm mb-4">{originalName ? "edit language" : "add language"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">proficiency</label>
                <select value={form.proficiency} onChange={(e) => setForm({ ...form, proficiency: e.target.value as ProficiencyLevel })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60">
                  {PROFICIENCY_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">percentage — {form.percentage}%</label>
                <input type="range" min={0} max={100} value={form.percentage}
                  onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })}
                  className="w-full accent-[#00ff9f]" />
                <div className="mt-2"><SkillBar percentage={form.percentage} /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} className="flex-1 border border-accent text-accent py-2 text-sm hover:bg-accent hover:text-background transition-colors">save</button>
              <button onClick={() => setForm(null)} className="flex-1 border border-border text-muted py-2 text-sm hover:border-accent/40 transition-colors">cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteName && <ConfirmModal message={`delete "${deleteName}"?`} onConfirm={confirmDelete} onCancel={() => setDeleteName(null)} />}
      {toast && <SaveToast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
