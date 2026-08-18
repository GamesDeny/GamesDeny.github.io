"use client";

import { useState } from "react";
import type { Skill, ProficiencyLevel } from "@/types";
import SkillBar from "@/components/ui/SkillBar";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import SaveToast from "@/components/admin/ui/SaveToast";
import BulkActionBar from "@/components/admin/ui/BulkActionBar";
import { Plus, Pencil, Trash2 } from "lucide-react";

const PROFICIENCY_LEVELS: ProficiencyLevel[] = [
  "Expert",
  "Proficient",
  "Familiar",
  "Learning",
];
const EMPTY: Skill = { name: "", proficiency: "Familiar", percentage: 50 };

async function runBulk<T>(items: T[], fn: (item: T) => Promise<Response>) {
  const results = await Promise.allSettled(items.map(fn));
  return items.filter(
    (_, i) => results[i].status === "fulfilled" && results[i].value.ok,
  );
}

export default function SkillsClient({
  initial,
}: Readonly<{ initial: Skill[] }>) {
  const [skills, setSkills] = useState(initial);

  // row-level
  const [form, setForm] = useState<Skill | null>(null);
  const [originalName, setOriginalName] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string | null>(null);

  // bulk
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkEdit, setBulkEdit] = useState(false);
  const [bulkProficiency, setBulkProficiency] = useState<"" | ProficiencyLevel>(
    "",
  );
  const [bulkApplyPct, setBulkApplyPct] = useState(false);
  const [bulkPct, setBulkPct] = useState(50);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") =>
    setToast({ msg, type });

  const allNames = skills.map((s) => s.name);
  const allSelected =
    allNames.length > 0 && allNames.every((n) => selected.has(n));
  const toggleOne = (name: string) =>
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(name) ? s.delete(name) : s.add(name);
      return s;
    });
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(allNames));
  const clearSelection = () => setSelected(new Set());

  const openNew = () => {
    setForm({ ...EMPTY });
    setOriginalName(null);
  };
  const openEdit = (s: Skill) => {
    setForm({ ...s });
    setOriginalName(s.name);
  };

  const save = async () => {
    if (!form) return;
    const isEdit = originalName !== null;
    const res = await fetch("/api/admin/skills", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) return showToast("save failed", "error");
    const saved: Skill = await res.json();
    setSkills((prev) =>
      isEdit
        ? prev.map((s) => (s.name === originalName ? saved : s))
        : [...prev, saved],
    );
    setForm(null);
    setOriginalName(null);
    showToast(isEdit ? "skill updated" : "skill added");
  };

  const confirmRowDelete = async () => {
    if (!deleteName) return;
    const res = await fetch(
      `/api/admin/skills?name=${encodeURIComponent(deleteName)}`,
      { method: "DELETE" },
    );
    if (!res.ok) return showToast("delete failed", "error");
    setSkills((prev) => prev.filter((s) => s.name !== deleteName));
    setDeleteName(null);
    showToast("skill deleted");
  };

  const confirmBulkDelete = async () => {
    const names = [...selected];
    const succeeded = await runBulk(names, (name) =>
      fetch(`/api/admin/skills?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
      }),
    );
    setSkills((prev) => prev.filter((s) => !succeeded.includes(s.name)));
    clearSelection();
    setBulkDeleteConfirm(false);
    const failed = names.length - succeeded.length;
    showToast(
      failed > 0
        ? `deleted ${succeeded.length}, ${failed} failed`
        : `deleted ${succeeded.length} skills`,
      failed > 0 ? "error" : "success",
    );
  };

  const applyBulkEdit = async () => {
    const patch: Partial<Skill> = {};
    if (bulkProficiency) patch.proficiency = bulkProficiency;
    if (bulkApplyPct) patch.percentage = bulkPct;
    if (Object.keys(patch).length === 0) {
      setBulkEdit(false);
      return;
    }

    const targets = skills.filter((s) => selected.has(s.name));
    const succeeded = await runBulk(targets, (s) =>
      fetch("/api/admin/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...s, ...patch }),
      }),
    );
    const succeededNames = new Set(succeeded.map((s) => s.name));
    setSkills((prev) =>
      prev.map((s) => (succeededNames.has(s.name) ? { ...s, ...patch } : s)),
    );
    clearSelection();
    setBulkEdit(false);
    setBulkProficiency("");
    setBulkApplyPct(false);
    const failed = targets.length - succeeded.length;
    showToast(
      failed > 0
        ? `updated ${succeeded.length}, ${failed} failed`
        : `updated ${succeeded.length} skills`,
      failed > 0 ? "error" : "success",
    );
  };

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-accent text-sm mb-1">&gt; admin / skills</p>
          <h1 className="text-2xl font-bold text-text-primary">skills</h1>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-2 border border-accent text-accent px-4 py-2 text-sm hover:bg-accent hover:text-background transition-colors"
        >
          <Plus size={14} /> add skill
        </button>
      </div>

      <div className="border border-border overflow-hidden">
        <table className="w-full text-sm font-mono">
          <thead className="bg-surface border-b border-border text-muted text-xs">
            <tr>
              <th className="px-4 py-3 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="accent-[#00ff9f]"
                />
              </th>
              <th className="text-left px-4 py-3">name</th>
              <th className="text-left px-4 py-3">proficiency</th>
              <th className="text-left px-4 py-3 w-48">bar</th>
              <th className="text-left px-4 py-3">%</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => (
              <tr
                key={s.name}
                className={`border-b border-border hover:bg-surface/50 ${selected.has(s.name) ? "bg-accent/5" : ""}`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(s.name)}
                    onChange={() => toggleOne(s.name)}
                    className="accent-[#00ff9f]"
                  />
                </td>
                <td className="px-4 py-3 text-text-primary">{s.name}</td>
                <td className="px-4 py-3 text-muted text-xs">
                  {s.proficiency}
                </td>
                <td className="px-4 py-3 w-48">
                  <SkillBar percentage={s.percentage} />
                </td>
                <td className="px-4 py-3 text-accent text-xs">
                  {s.percentage}%
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => openEdit(s)}
                      className="text-muted hover:text-accent"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteName(s.name)}
                      className="text-muted hover:text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {skills.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted text-xs"
                >
                  no skills yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Row edit modal */}
      {form && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6">
          <div className="bg-surface border border-border w-full max-w-sm p-6 font-mono">
            <h2 className="text-accent text-sm mb-4">
              {originalName ? "edit skill" : "add skill"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">
                  proficiency
                </label>
                <select
                  value={form.proficiency}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      proficiency: e.target.value as ProficiencyLevel,
                    })
                  }
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60"
                >
                  {PROFICIENCY_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">
                  percentage — {form.percentage}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.percentage}
                  onChange={(e) =>
                    setForm({ ...form, percentage: Number(e.target.value) })
                  }
                  className="w-full accent-[#00ff9f]"
                />
                <div className="mt-2">
                  <SkillBar percentage={form.percentage} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={save}
                className="flex-1 border border-accent text-accent py-2 text-sm hover:bg-accent hover:text-background transition-colors"
              >
                save
              </button>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="flex-1 border border-border text-muted py-2 text-sm hover:border-accent/40 transition-colors"
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk edit modal */}
      {bulkEdit && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6">
          <div className="bg-surface border border-border w-full max-w-sm p-6 font-mono">
            <h2 className="text-accent text-sm mb-1">bulk edit</h2>
            <p className="text-xs text-muted mb-4">
              {selected.size} skills selected
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">
                  proficiency
                </label>
                <select
                  value={bulkProficiency}
                  onChange={(e) =>
                    setBulkProficiency(e.target.value as typeof bulkProficiency)
                  }
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60"
                >
                  <option value="">— no change —</option>
                  {PROFICIENCY_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs text-muted mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkApplyPct}
                    onChange={(e) => setBulkApplyPct(e.target.checked)}
                    className="accent-[#00ff9f]"
                  />
                  set percentage — {bulkPct}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={bulkPct}
                  disabled={!bulkApplyPct}
                  onChange={(e) => setBulkPct(Number(e.target.value))}
                  className={`w-full accent-[#00ff9f] ${bulkApplyPct ? "" : "opacity-40"}`}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={applyBulkEdit}
                className="flex-1 border border-accent text-accent py-2 text-sm hover:bg-accent hover:text-background transition-colors"
              >
                apply
              </button>
              <button
                type="button"
                onClick={() => setBulkEdit(false)}
                className="flex-1 border border-border text-muted py-2 text-sm hover:border-accent/40 transition-colors"
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteName && (
        <ConfirmModal
          message={`delete "${deleteName}"?`}
          onConfirm={confirmRowDelete}
          onCancel={() => setDeleteName(null)}
        />
      )}
      {bulkDeleteConfirm && (
        <ConfirmModal
          message={`delete ${selected.size} skills?`}
          onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteConfirm(false)}
        />
      )}
      {toast && (
        <SaveToast
          message={toast.msg}
          type={toast.type}
          onDismiss={() => setToast(null)}
          offsetBottom={selected.size > 0}
        />
      )}

      <BulkActionBar
        count={selected.size}
        onEdit={() => setBulkEdit(true)}
        onDelete={() => setBulkDeleteConfirm(true)}
        onClear={clearSelection}
      />
    </div>
  );
}
