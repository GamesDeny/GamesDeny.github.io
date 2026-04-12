"use client";

import { useState } from "react";
import type { WorkEntry, EducationEntry } from "@/types";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import SaveToast from "@/components/admin/ui/SaveToast";
import { Plus, Pencil, Trash2, X } from "lucide-react";

// ─── Work form ───────────────────────────────────────────────────────────────

const EMPTY_WORK: Omit<WorkEntry, "id"> = {
  company: "", role: "", startDate: "", endDate: null, location: "", bullets: [""], skills: [],
};

interface WorkFormState extends Omit<WorkEntry, "id" | "bullets" | "skills" | "endDate"> {
  id?: string; bullets: string[]; skills: string; endDate: string;
}

function toWorkForm(e: WorkEntry): WorkFormState {
  return { ...e, skills: (e.skills ?? []).join(", "), endDate: e.endDate ?? "" };
}
function fromWorkForm(f: WorkFormState): Omit<WorkEntry, "id"> {
  return {
    company: f.company, role: f.role, startDate: f.startDate,
    endDate: f.endDate.trim() === "" ? null : f.endDate,
    location: f.location,
    bullets: f.bullets.filter(Boolean),
    skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean),
  };
}

// ─── Education form ───────────────────────────────────────────────────────────

const EMPTY_EDU: Omit<EducationEntry, "id"> = {
  institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "", notes: [],
};

interface EduFormState extends Omit<EducationEntry, "id" | "notes"> {
  id?: string; notes: string[];
}

function toEduForm(e: EducationEntry): EduFormState {
  return { ...e, notes: e.notes ?? [] };
}
function fromEduForm(f: EduFormState): Omit<EducationEntry, "id"> {
  return { institution: f.institution, degree: f.degree, field: f.field, startDate: f.startDate, endDate: f.endDate, gpa: f.gpa, notes: f.notes.filter(Boolean) };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ExperienceClient({
  initialExperience, initialEducation,
}: { initialExperience: WorkEntry[]; initialEducation: EducationEntry[] }) {
  const [tab, setTab] = useState<"work" | "education">("work");
  const [experience, setExperience] = useState(initialExperience);
  const [education, setEducation] = useState(initialEducation);
  const [workForm, setWorkForm] = useState<WorkFormState | null>(null);
  const [eduForm, setEduForm] = useState<EduFormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "work" | "edu"; id: string } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => setToast({ msg, type });

  // ── Work CRUD ──
  const saveWork = async () => {
    if (!workForm) return;
    const body = fromWorkForm(workForm);
    const isEdit = !!workForm.id;
    const res = await fetch("/api/admin/experience", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? { ...body, id: workForm.id } : body),
    });
    if (!res.ok) return showToast("save failed", "error");
    const saved: WorkEntry = await res.json();
    setExperience((prev) => isEdit ? prev.map((e) => e.id === workForm.id ? saved : e) : [...prev, saved]);
    setWorkForm(null);
    showToast(isEdit ? "entry updated" : "entry created");
  };

  // ── Education CRUD ──
  const saveEdu = async () => {
    if (!eduForm) return;
    const body = fromEduForm(eduForm);
    const isEdit = !!eduForm.id;
    const res = await fetch("/api/admin/education", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? { ...body, id: eduForm.id } : body),
    });
    if (!res.ok) return showToast("save failed", "error");
    const saved: EducationEntry = await res.json();
    setEducation((prev) => isEdit ? prev.map((e) => e.id === eduForm.id ? saved : e) : [...prev, saved]);
    setEduForm(null);
    showToast(isEdit ? "entry updated" : "entry created");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    const url = type === "work" ? `/api/admin/experience?id=${id}` : `/api/admin/education?id=${id}`;
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) return showToast("delete failed", "error");
    if (type === "work") setExperience((prev) => prev.filter((e) => e.id !== id));
    else setEducation((prev) => prev.filter((e) => e.id !== id));
    setDeleteTarget(null);
    showToast("entry deleted");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-accent text-sm mb-1">&gt; admin / experience</p>
          <h1 className="text-2xl font-bold text-text-primary">experience</h1>
        </div>
        <button
          onClick={() => tab === "work" ? setWorkForm({ ...EMPTY_WORK, skills: "", endDate: "" }) : setEduForm({ ...EMPTY_EDU, notes: [] })}
          className="flex items-center gap-2 border border-accent text-accent px-4 py-2 text-sm hover:bg-accent hover:text-background transition-colors"
        >
          <Plus size={14} /> new entry
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border border-border w-fit">
        {(["work", "education"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-mono transition-colors ${tab === t ? "bg-accent text-background" : "text-muted hover:text-text-primary"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Work table */}
      {tab === "work" && (
        <div className="border border-border overflow-hidden">
          <table className="w-full text-sm font-mono">
            <thead className="bg-surface border-b border-border text-muted text-xs">
              <tr>
                <th className="text-left px-4 py-3">company</th>
                <th className="text-left px-4 py-3">role</th>
                <th className="text-left px-4 py-3">period</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {experience.map((e) => (
                <tr key={e.id} className="border-b border-border hover:bg-surface/50">
                  <td className="px-4 py-3 text-accent">{e.company}</td>
                  <td className="px-4 py-3 text-text-primary">{e.role}</td>
                  <td className="px-4 py-3 text-muted text-xs">{e.startDate} — {e.endDate ?? "Present"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setWorkForm(toWorkForm(e))} className="text-muted hover:text-accent"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteTarget({ type: "work", id: e.id! })} className="text-muted hover:text-red-400"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {experience.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted text-xs">no entries yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Education table */}
      {tab === "education" && (
        <div className="border border-border overflow-hidden">
          <table className="w-full text-sm font-mono">
            <thead className="bg-surface border-b border-border text-muted text-xs">
              <tr>
                <th className="text-left px-4 py-3">institution</th>
                <th className="text-left px-4 py-3">degree</th>
                <th className="text-left px-4 py-3">period</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {education.map((e) => (
                <tr key={e.id} className="border-b border-border hover:bg-surface/50">
                  <td className="px-4 py-3 text-accent">{e.institution}</td>
                  <td className="px-4 py-3 text-text-primary">{e.degree} {e.field}</td>
                  <td className="px-4 py-3 text-muted text-xs">{e.startDate} — {e.endDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setEduForm(toEduForm(e))} className="text-muted hover:text-accent"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteTarget({ type: "edu", id: e.id! })} className="text-muted hover:text-red-400"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {education.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted text-xs">no entries yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Work form modal */}
      {workForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6">
          <div className="bg-surface border border-border w-full max-w-lg p-6 font-mono overflow-y-auto max-h-[90vh]">
            <h2 className="text-accent text-sm mb-4">{workForm.id ? "edit work entry" : "new work entry"}</h2>
            <div className="space-y-4">
              {(["company", "role", "location", "startDate"] as const).map((f) => (
                <div key={f}>
                  <label className="block text-xs text-muted mb-1">{f}</label>
                  <input type="text" value={workForm[f]} onChange={(e) => setWorkForm({ ...workForm, [f]: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-muted mb-1">endDate (leave empty for Present)</label>
                <input type="text" value={workForm.endDate} onChange={(e) => setWorkForm({ ...workForm, endDate: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">bullets</label>
                {workForm.bullets.map((b, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" value={b} onChange={(e) => setWorkForm({ ...workForm, bullets: workForm.bullets.map((x, j) => j === i ? e.target.value : x) })}
                      className="flex-1 bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
                    <button onClick={() => setWorkForm({ ...workForm, bullets: workForm.bullets.filter((_, j) => j !== i) })} className="text-muted hover:text-red-400"><X size={14} /></button>
                  </div>
                ))}
                <button onClick={() => setWorkForm({ ...workForm, bullets: [...workForm.bullets, ""] })} className="text-xs text-accent hover:underline">+ add bullet</button>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">skills (comma-separated)</label>
                <input type="text" value={workForm.skills} onChange={(e) => setWorkForm({ ...workForm, skills: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={saveWork} className="flex-1 border border-accent text-accent py-2 text-sm hover:bg-accent hover:text-background transition-colors">save</button>
              <button onClick={() => setWorkForm(null)} className="flex-1 border border-border text-muted py-2 text-sm hover:border-accent/40 transition-colors">cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Education form modal */}
      {eduForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6">
          <div className="bg-surface border border-border w-full max-w-lg p-6 font-mono overflow-y-auto max-h-[90vh]">
            <h2 className="text-accent text-sm mb-4">{eduForm.id ? "edit education entry" : "new education entry"}</h2>
            <div className="space-y-4">
              {(["institution", "degree", "field", "startDate", "endDate", "gpa"] as const).map((f) => (
                <div key={f}>
                  <label className="block text-xs text-muted mb-1">{f}</label>
                  <input type="text" value={(eduForm[f] as string) ?? ""} onChange={(e) => setEduForm({ ...eduForm, [f]: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-muted mb-1">notes</label>
                {eduForm.notes.map((n, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" value={n} onChange={(e) => setEduForm({ ...eduForm, notes: eduForm.notes.map((x, j) => j === i ? e.target.value : x) })}
                      className="flex-1 bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
                    <button onClick={() => setEduForm({ ...eduForm, notes: eduForm.notes.filter((_, j) => j !== i) })} className="text-muted hover:text-red-400"><X size={14} /></button>
                  </div>
                ))}
                <button onClick={() => setEduForm({ ...eduForm, notes: [...eduForm.notes, ""] })} className="text-xs text-accent hover:underline">+ add note</button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={saveEdu} className="flex-1 border border-accent text-accent py-2 text-sm hover:bg-accent hover:text-background transition-colors">save</button>
              <button onClick={() => setEduForm(null)} className="flex-1 border border-border text-muted py-2 text-sm hover:border-accent/40 transition-colors">cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && <ConfirmModal message="delete this entry?" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />}
      {toast && <SaveToast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
