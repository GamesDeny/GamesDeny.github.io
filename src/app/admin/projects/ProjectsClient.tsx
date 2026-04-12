"use client";

import { useState } from "react";
import type { Project } from "@/types";
import Badge from "@/components/ui/Badge";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import SaveToast from "@/components/admin/ui/SaveToast";
import { Plus, Pencil, Trash2, ExternalLink, GitFork } from "lucide-react";

const EMPTY: Omit<Project, "id"> = {
  name: "", description: "", techStack: [], githubUrl: "", liveUrl: "", featured: false,
};

interface FormState extends Omit<Project, "techStack"> { techStack: string; }

function toFormState(p: Project): FormState {
  return { ...p, techStack: p.techStack.join(", ") };
}
function fromFormState(f: FormState): Omit<Project, "id"> {
  return { ...f, techStack: f.techStack.split(",").map((s) => s.trim()).filter(Boolean) };
}

export default function ProjectsClient({ initial }: { initial: Project[] }) {
  const [projects, setProjects] = useState(initial);
  const [form, setForm] = useState<FormState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") =>
    setToast({ msg, type });

  const openNew = () => { setForm({ ...EMPTY, id: "", techStack: "" }); setEditingId(null); };
  const openEdit = (p: Project) => { setForm(toFormState(p)); setEditingId(p.id ?? null); };
  const closeForm = () => { setForm(null); setEditingId(null); };

  const save = async () => {
    if (!form) return;
    const body = fromFormState(form);
    const isEdit = !!editingId;
    const res = await fetch("/api/admin/projects", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? { ...body, id: editingId } : body),
    });
    if (!res.ok) return showToast("save failed", "error");
    const saved: Project = await res.json();
    setProjects((prev) =>
      isEdit ? prev.map((p) => (p.id === editingId ? saved : p)) : [...prev, saved]
    );
    closeForm();
    showToast(isEdit ? "project updated" : "project created");
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/projects?id=${deleteId}`, { method: "DELETE" });
    if (!res.ok) return showToast("delete failed", "error");
    setProjects((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    showToast("project deleted");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-accent text-sm mb-1">&gt; admin / projects</p>
          <h1 className="text-2xl font-bold text-text-primary">projects</h1>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 border border-accent text-accent px-4 py-2 text-sm hover:bg-accent hover:text-background transition-colors">
          <Plus size={14} /> new project
        </button>
      </div>

      {/* Table */}
      <div className="border border-border overflow-hidden">
        <table className="w-full text-sm font-mono">
          <thead className="bg-surface border-b border-border text-muted text-xs">
            <tr>
              <th className="text-left px-4 py-3">name</th>
              <th className="text-left px-4 py-3">stack</th>
              <th className="text-left px-4 py-3">featured</th>
              <th className="text-left px-4 py-3">links</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-border hover:bg-surface/50">
                <td className="px-4 py-3 text-text-primary">{p.name}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.techStack.slice(0, 3).map((t) => <Badge key={t} label={t} />)}
                    {p.techStack.length > 3 && <span className="text-muted text-xs">+{p.techStack.length - 3}</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {p.featured && <span className="text-accent text-xs">✓</span>}
                </td>
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
            {projects.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted text-xs">no projects yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form panel */}
      {form && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6">
          <div className="bg-surface border border-border w-full max-w-lg p-6 font-mono overflow-y-auto max-h-[90vh]">
            <h2 className="text-accent text-sm mb-4">{editingId ? "edit project" : "new project"}</h2>
            <div className="space-y-4">
              {(["name", "description", "githubUrl", "liveUrl"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs text-muted mb-1">{field}</label>
                  {field === "description" ? (
                    <textarea
                      rows={3}
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60 resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[field] ?? ""}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60"
                    />
                  )}
                </div>
              ))}
              <div>
                <label className="block text-xs text-muted mb-1">tech stack (comma-separated)</label>
                <input
                  type="text"
                  value={form.techStack}
                  onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-[#00ff9f]" />
                featured
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} className="flex-1 border border-accent text-accent py-2 text-sm hover:bg-accent hover:text-background transition-colors">save</button>
              <button onClick={closeForm} className="flex-1 border border-border text-muted py-2 text-sm hover:border-accent/40 hover:text-text-primary transition-colors">cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          message="delete this project?"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
      {toast && <SaveToast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
