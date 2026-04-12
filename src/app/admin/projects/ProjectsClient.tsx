"use client";

import { useState } from "react";
import type { Project, LocalizedString } from "@/types";
import { localized } from "@/lib/i18n-utils";
import Badge from "@/components/ui/Badge";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import SaveToast from "@/components/admin/ui/SaveToast";
import BulkActionBar from "@/components/admin/ui/BulkActionBar";
import { Plus, Pencil, Trash2, ExternalLink, GitFork } from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────

interface FormState {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  techStack: string; // comma-separated
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
}

function emptyLocalized(locales: string[]): LocalizedString {
  return Object.fromEntries(locales.map((l) => [l, ""]));
}

function toForm(p: Project, locales: string[]): FormState {
  return {
    id: p.id,
    name: { ...emptyLocalized(locales), ...p.name },
    description: { ...emptyLocalized(locales), ...p.description },
    techStack: p.techStack.join(", "),
    githubUrl: p.githubUrl ?? "",
    liveUrl: p.liveUrl ?? "",
    featured: p.featured ?? false,
  };
}

function fromForm(f: FormState): Omit<Project, "id"> {
  return {
    name: f.name,
    description: f.description,
    techStack: f.techStack.split(",").map((s) => s.trim()).filter(Boolean),
    githubUrl: f.githubUrl || undefined,
    liveUrl: f.liveUrl || undefined,
    featured: f.featured,
  };
}

async function runBulk<T>(ids: T[], fn: (id: T) => Promise<Response>) {
  const results = await Promise.allSettled(ids.map(fn));
  return ids.filter((_, i) => results[i].status === "fulfilled" && (results[i] as PromiseFulfilledResult<Response>).value.ok);
}

// ─── component ────────────────────────────────────────────────────────────────

export default function ProjectsClient({
  initial,
  locales,
}: {
  initial: Project[];
  locales: string[];
}) {
  const [projects, setProjects] = useState(initial);

  // row-level
  const [form, setForm] = useState<FormState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // bulk
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkEdit, setBulkEdit] = useState(false);
  const [bulkFeatured, setBulkFeatured] = useState<"no-change" | "true" | "false">("no-change");
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => setToast({ msg, type });

  // selection
  const allIds = projects.map((p) => p.id!).filter(Boolean);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const toggleOne = (id: string) => setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(allIds));
  const clearSelection = () => setSelected(new Set());

  const openNew = () => {
    const emptyForm: FormState = {
      id: "",
      name: emptyLocalized(locales),
      description: emptyLocalized(locales),
      techStack: "",
      githubUrl: "",
      liveUrl: "",
      featured: false,
    };
    setForm(emptyForm);
    setEditingId(null);
  };
  const openEdit = (p: Project) => { setForm(toForm(p, locales)); setEditingId(p.id ?? null); };
  const closeForm = () => { setForm(null); setEditingId(null); };

  // ── CRUD ────────────────────────────────────────────────────────────────────

  const save = async () => {
    if (!form) return;
    const body = fromForm(form);
    const isEdit = !!editingId;
    const res = await fetch("/api/admin/projects", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? { ...body, id: editingId } : body),
    });
    if (!res.ok) return showToast("save failed", "error");
    const saved: Project = await res.json();
    setProjects((prev) => isEdit ? prev.map((p) => (p.id === editingId ? saved : p)) : [...prev, saved]);
    closeForm();
    showToast(isEdit ? "project updated" : "project created");
  };

  const confirmRowDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/projects?id=${deleteId}`, { method: "DELETE" });
    if (!res.ok) return showToast("delete failed", "error");
    setProjects((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    showToast("project deleted");
  };

  const confirmBulkDelete = async () => {
    const ids = [...selected];
    const succeeded = await runBulk(ids, (id) => fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" }));
    setProjects((prev) => prev.filter((p) => !succeeded.includes(p.id!)));
    clearSelection();
    setBulkDeleteConfirm(false);
    const failed = ids.length - succeeded.length;
    showToast(failed > 0 ? `deleted ${succeeded.length}, ${failed} failed` : `deleted ${succeeded.length} projects`, failed > 0 ? "error" : "success");
  };

  const applyBulkEdit = async () => {
    if (bulkFeatured === "no-change") { setBulkEdit(false); return; }
    const patch = { featured: bulkFeatured === "true" };
    const targets = projects.filter((p) => selected.has(p.id!));
    const succeeded = await runBulk(targets, (p) =>
      fetch("/api/admin/projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...p, ...patch }) })
    );
    const succeededIds = new Set(succeeded.map((p) => p.id!));
    setProjects((prev) => prev.map((p) => succeededIds.has(p.id!) ? { ...p, ...patch } : p));
    clearSelection();
    setBulkEdit(false);
    setBulkFeatured("no-change");
    const failed = targets.length - succeeded.length;
    showToast(failed > 0 ? `updated ${succeeded.length}, ${failed} failed` : `updated ${succeeded.length} projects`, failed > 0 ? "error" : "success");
  };

  // ─── render ─────────────────────────────────────────────────────────────────

  // Display locale for table: prefer "en", else first
  const displayLocale = locales.includes("en") ? "en" : locales[0];

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-accent text-sm mb-1">&gt; admin / projects</p>
          <h1 className="text-2xl font-bold text-text-primary">projects</h1>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 border border-accent text-accent px-4 py-2 text-sm hover:bg-accent hover:text-background transition-colors">
          <Plus size={14} /> new project
        </button>
      </div>

      <div className="border border-border overflow-hidden">
        <table className="w-full text-sm font-mono">
          <thead className="bg-surface border-b border-border text-muted text-xs">
            <tr>
              <th className="px-4 py-3 w-8"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-[#00ff9f]" /></th>
              <th className="text-left px-4 py-3">name</th>
              <th className="text-left px-4 py-3">stack</th>
              <th className="text-left px-4 py-3">featured</th>
              <th className="text-left px-4 py-3">links</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className={`border-b border-border hover:bg-surface/50 ${selected.has(p.id!) ? "bg-accent/5" : ""}`}>
                <td className="px-4 py-3"><input type="checkbox" checked={selected.has(p.id!)} onChange={() => toggleOne(p.id!)} className="accent-[#00ff9f]" /></td>
                <td className="px-4 py-3 text-text-primary">{localized(p.name, displayLocale)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.techStack.slice(0, 3).map((t) => <Badge key={t} label={t} />)}
                    {p.techStack.length > 3 && <span className="text-muted text-xs">+{p.techStack.length - 3}</span>}
                  </div>
                </td>
                <td className="px-4 py-3">{p.featured && <span className="text-accent text-xs">✓</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent"><GitFork size={13} /></a>}
                    {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent"><ExternalLink size={13} /></a>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => openEdit(p)} className="text-muted hover:text-accent"><Pencil size={13} /></button>
                    <button onClick={() => setDeleteId(p.id ?? null)} className="text-muted hover:text-red-400"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted text-xs">no projects yet</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Row edit modal */}
      {form && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6">
          <div className="bg-surface border border-border w-full max-w-xl p-6 font-mono overflow-y-auto max-h-[90vh]">
            <h2 className="text-accent text-sm mb-4">{editingId ? "edit project" : "new project"}</h2>
            <div className="space-y-5">

              {/* Localized: name */}
              <div>
                <label className="block text-xs text-muted mb-2">name</label>
                {locales.map((l) => (
                  <div key={l} className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-accent w-6 shrink-0 uppercase">{l}</span>
                    <input type="text" value={form.name[l] ?? ""} onChange={(e) => setForm({ ...form, name: { ...form.name, [l]: e.target.value } })}
                      className="flex-1 bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
                  </div>
                ))}
              </div>

              {/* Localized: description */}
              <div>
                <label className="block text-xs text-muted mb-2">description</label>
                {locales.map((l) => (
                  <div key={l} className="flex items-start gap-2 mb-2">
                    <span className="text-xs text-accent w-6 shrink-0 uppercase pt-2.5">{l}</span>
                    <textarea rows={3} value={form.description[l] ?? ""} onChange={(e) => setForm({ ...form, description: { ...form.description, [l]: e.target.value } })}
                      className="flex-1 bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60 resize-none" />
                  </div>
                ))}
              </div>

              {/* Non-localized fields */}
              <div>
                <label className="block text-xs text-muted mb-1">tech stack (comma-separated)</label>
                <input type="text" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
              </div>
              {(["githubUrl", "liveUrl"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs text-muted mb-1">{field}</label>
                  <input type="text" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
                </div>
              ))}
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-[#00ff9f]" />
                featured
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={save} className="flex-1 border border-accent text-accent py-2 text-sm hover:bg-accent hover:text-background transition-colors">save</button>
              <button onClick={closeForm} className="flex-1 border border-border text-muted py-2 text-sm hover:border-accent/40 transition-colors">cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk edit modal */}
      {bulkEdit && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6">
          <div className="bg-surface border border-border w-full max-w-sm p-6 font-mono">
            <h2 className="text-accent text-sm mb-1">bulk edit</h2>
            <p className="text-xs text-muted mb-4">{selected.size} projects selected</p>
            <div>
              <label className="block text-xs text-muted mb-1">featured</label>
              <select value={bulkFeatured} onChange={(e) => setBulkFeatured(e.target.value as typeof bulkFeatured)}
                className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60">
                <option value="no-change">— no change —</option>
                <option value="true">set featured</option>
                <option value="false">remove featured</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={applyBulkEdit} className="flex-1 border border-accent text-accent py-2 text-sm hover:bg-accent hover:text-background transition-colors">apply</button>
              <button onClick={() => setBulkEdit(false)} className="flex-1 border border-border text-muted py-2 text-sm hover:border-accent/40 transition-colors">cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && <ConfirmModal message="delete this project?" onConfirm={confirmRowDelete} onCancel={() => setDeleteId(null)} />}
      {bulkDeleteConfirm && <ConfirmModal message={`delete ${selected.size} projects?`} onConfirm={confirmBulkDelete} onCancel={() => setBulkDeleteConfirm(false)} />}
      {toast && <SaveToast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} offsetBottom={selected.size > 0} />}

      <BulkActionBar count={selected.size} onEdit={() => setBulkEdit(true)} onDelete={() => setBulkDeleteConfirm(true)} onClear={clearSelection} />
    </div>
  );
}
