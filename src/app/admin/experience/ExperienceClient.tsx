"use client";

import { useState } from "react";
import type { WorkEntry, EducationEntry, LocalizedString, LocalizedStringArray } from "@/types";
import { localized } from "@/lib/i18n-utils";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import SaveToast from "@/components/admin/ui/SaveToast";
import BulkActionBar from "@/components/admin/ui/BulkActionBar";
import { Plus, Pencil, Trash2, X } from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────

async function runBulk<T>(items: T[], fn: (item: T) => Promise<Response>) {
  const results = await Promise.allSettled(items.map(fn));
  return items.filter((_, i) => results[i].status === "fulfilled" && (results[i] as PromiseFulfilledResult<Response>).value.ok);
}

function emptyLocalized(locales: string[]): LocalizedString {
  return Object.fromEntries(locales.map((l) => [l, ""]));
}
function emptyLocalizedArray(locales: string[]): LocalizedStringArray {
  return Object.fromEntries(locales.map((l) => [l, [""]]));
}

// ─── Form state types ─────────────────────────────────────────────────────────

interface WorkFormState {
  id: string;
  company: string;
  role: LocalizedString;
  startDate: string;
  endDate: string; // empty string = Present
  location: string;
  bullets: LocalizedStringArray;
  skills: string; // comma-separated
}

interface EduFormState {
  id: string;
  institution: string;
  degree: LocalizedString;
  field: LocalizedString;
  startDate: string;
  endDate: string;
  gpa: string;
  notes: LocalizedStringArray;
}

function toWorkForm(e: WorkEntry, locales: string[]): WorkFormState {
  return {
    id: e.id ?? "",
    company: e.company,
    role: { ...emptyLocalized(locales), ...e.role },
    startDate: e.startDate,
    endDate: e.endDate ?? "",
    location: e.location,
    bullets: Object.fromEntries(
      locales.map((l) => [l, (e.bullets[l] ?? e.bullets.en ?? Object.values(e.bullets)[0] ?? [""]).length > 0
        ? (e.bullets[l] ?? e.bullets.en ?? Object.values(e.bullets)[0] ?? [""])
        : [""]])
    ),
    skills: (e.skills ?? []).join(", "),
  };
}

function fromWorkForm(f: WorkFormState): Omit<WorkEntry, "id"> {
  return {
    company: f.company,
    role: f.role,
    startDate: f.startDate,
    endDate: f.endDate.trim() === "" ? null : f.endDate,
    location: f.location,
    bullets: Object.fromEntries(
      Object.entries(f.bullets).map(([l, arr]) => [l, arr.filter(Boolean)])
    ),
    skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean),
  };
}

function toEduForm(e: EducationEntry, locales: string[]): EduFormState {
  return {
    id: e.id ?? "",
    institution: e.institution,
    degree: { ...emptyLocalized(locales), ...e.degree },
    field: { ...emptyLocalized(locales), ...e.field },
    startDate: e.startDate,
    endDate: e.endDate,
    gpa: e.gpa ?? "",
    notes: e.notes
      ? Object.fromEntries(locales.map((l) => [l, (e.notes![l] ?? e.notes!.en ?? Object.values(e.notes!)[0] ?? [""]).length > 0
          ? (e.notes![l] ?? e.notes!.en ?? Object.values(e.notes!)[0] ?? [""])
          : [""]]))
      : emptyLocalizedArray(locales),
  };
}

function fromEduForm(f: EduFormState): Omit<EducationEntry, "id"> {
  return {
    institution: f.institution,
    degree: f.degree,
    field: f.field,
    startDate: f.startDate,
    endDate: f.endDate,
    gpa: f.gpa || undefined,
    notes: Object.fromEntries(
      Object.entries(f.notes).map(([l, arr]) => [l, arr.filter(Boolean)])
    ),
  };
}

// ─── component ────────────────────────────────────────────────────────────────

export default function ExperienceClient({
  initialExperience,
  initialEducation,
  locales,
}: {
  initialExperience: WorkEntry[];
  initialEducation: EducationEntry[];
  locales: string[];
}) {
  const displayLocale = locales.includes("en") ? "en" : locales[0];

  const [tab, setTab] = useState<"work" | "education">("work");
  const [experience, setExperience] = useState(initialExperience);
  const [education, setEducation] = useState(initialEducation);

  const [workForm, setWorkForm] = useState<WorkFormState | null>(null);
  const [eduForm, setEduForm] = useState<EduFormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "work" | "edu"; id: string } | null>(null);

  // bulk
  const [selectedWork, setSelectedWork] = useState<Set<string>>(new Set());
  const [selectedEdu, setSelectedEdu] = useState<Set<string>>(new Set());
  const [bulkEdit, setBulkEdit] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkEndDate, setBulkEndDate] = useState<"no-change" | "present" | "date">("no-change");
  const [bulkEndDateVal, setBulkEndDateVal] = useState("");
  const [bulkLocation, setBulkLocation] = useState("");
  const [bulkEduEndDate, setBulkEduEndDate] = useState("");

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => setToast({ msg, type });

  const activeSelected = tab === "work" ? selectedWork : selectedEdu;
  const setActiveSelected = tab === "work" ? setSelectedWork : setSelectedEdu;
  const activeItems = tab === "work" ? experience : education;
  const activeIds = activeItems.map((e) => e.id!).filter(Boolean);
  const allSelected = activeIds.length > 0 && activeIds.every((id) => activeSelected.has(id));

  const toggleOne = (id: string) => setActiveSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () => setActiveSelected(allSelected ? new Set() : new Set(activeIds));
  const clearSelection = () => { setSelectedWork(new Set()); setSelectedEdu(new Set()); };

  // ── Work CRUD ──────────────────────────────────────────────────────────────

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

  // ── Education CRUD ─────────────────────────────────────────────────────────

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

  // ── Row delete ─────────────────────────────────────────────────────────────

  const confirmRowDelete = async () => {
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

  // ── Bulk delete ────────────────────────────────────────────────────────────

  const confirmBulkDelete = async () => {
    const ids = [...activeSelected];
    const endpoint = tab === "work" ? "/api/admin/experience" : "/api/admin/education";
    const succeeded = await runBulk(ids, (id) => fetch(`${endpoint}?id=${id}`, { method: "DELETE" }));
    if (tab === "work") setExperience((prev) => prev.filter((e) => !succeeded.includes(e.id!)));
    else setEducation((prev) => prev.filter((e) => !succeeded.includes(e.id!)));
    clearSelection();
    setBulkDeleteConfirm(false);
    const failed = ids.length - succeeded.length;
    showToast(failed > 0 ? `deleted ${succeeded.length}, ${failed} failed` : `deleted ${succeeded.length} entries`, failed > 0 ? "error" : "success");
  };

  // ── Bulk edit ──────────────────────────────────────────────────────────────

  const applyBulkEdit = async () => {
    if (tab === "work") {
      const patch: Partial<WorkEntry> = {};
      if (bulkEndDate === "present") patch.endDate = null;
      else if (bulkEndDate === "date" && bulkEndDateVal.trim()) patch.endDate = bulkEndDateVal.trim();
      if (bulkLocation.trim()) patch.location = bulkLocation.trim();
      if (Object.keys(patch).length === 0) { setBulkEdit(false); return; }
      const targets = experience.filter((e) => selectedWork.has(e.id!));
      const succeeded = await runBulk(targets, (e) =>
        fetch("/api/admin/experience", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...e, ...patch }) })
      );
      const ids = new Set(succeeded.map((e) => e.id!));
      setExperience((prev) => prev.map((e) => ids.has(e.id!) ? { ...e, ...patch } : e));
      const failed = targets.length - succeeded.length;
      showToast(failed > 0 ? `updated ${succeeded.length}, ${failed} failed` : `updated ${succeeded.length} entries`, failed > 0 ? "error" : "success");
    } else {
      const patch: Partial<EducationEntry> = {};
      if (bulkEduEndDate.trim()) patch.endDate = bulkEduEndDate.trim();
      if (Object.keys(patch).length === 0) { setBulkEdit(false); return; }
      const targets = education.filter((e) => selectedEdu.has(e.id!));
      const succeeded = await runBulk(targets, (e) =>
        fetch("/api/admin/education", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...e, ...patch }) })
      );
      const ids = new Set(succeeded.map((e) => e.id!));
      setEducation((prev) => prev.map((e) => ids.has(e.id!) ? { ...e, ...patch } : e));
      const failed = targets.length - succeeded.length;
      showToast(failed > 0 ? `updated ${succeeded.length}, ${failed} failed` : `updated ${succeeded.length} entries`, failed > 0 ? "error" : "success");
    }
    clearSelection();
    setBulkEdit(false);
    setBulkEndDate("no-change");
    setBulkEndDateVal("");
    setBulkLocation("");
    setBulkEduEndDate("");
  };

  // ── LocalizedString input ──────────────────────────────────────────────────

  function LocalizedInput({ label, value, onChange }: {
    label: string;
    value: LocalizedString;
    onChange: (v: LocalizedString) => void;
  }) {
    return (
      <div>
        <label className="block text-xs text-muted mb-2">{label}</label>
        {locales.map((l) => (
          <div key={l} className="flex items-center gap-2 mb-2">
            <span className="text-xs text-accent w-6 shrink-0 uppercase">{l}</span>
            <input type="text" value={value[l] ?? ""} onChange={(e) => onChange({ ...value, [l]: e.target.value })}
              className="flex-1 bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
          </div>
        ))}
      </div>
    );
  }

  function LocalizedBullets({ label, value, onChange }: {
    label: string;
    value: LocalizedStringArray;
    onChange: (v: LocalizedStringArray) => void;
  }) {
    return (
      <div>
        <label className="block text-xs text-muted mb-2">{label}</label>
        {locales.map((l) => {
          const arr = value[l] ?? [""];
          return (
            <div key={l} className="mb-4">
              <p className="text-xs text-accent uppercase mb-2">{l}</p>
              {arr.map((b, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input type="text" value={b}
                    onChange={(e) => onChange({ ...value, [l]: arr.map((x, j) => j === i ? e.target.value : x) })}
                    className="flex-1 bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
                  <button onClick={() => onChange({ ...value, [l]: arr.filter((_, j) => j !== i) })} className="text-muted hover:text-red-400"><X size={14} /></button>
                </div>
              ))}
              <button onClick={() => onChange({ ...value, [l]: [...arr, ""] })} className="text-xs text-accent hover:underline">+ add</button>
            </div>
          );
        })}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-accent text-sm mb-1">&gt; admin / experience</p>
          <h1 className="text-2xl font-bold text-text-primary">experience</h1>
        </div>
        <button
          onClick={() => tab === "work"
            ? setWorkForm({ id: "", company: "", role: emptyLocalized(locales), startDate: "", endDate: "", location: "", bullets: emptyLocalizedArray(locales), skills: "" })
            : setEduForm({ id: "", institution: "", degree: emptyLocalized(locales), field: emptyLocalized(locales), startDate: "", endDate: "", gpa: "", notes: emptyLocalizedArray(locales) })
          }
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
                <th className="px-4 py-3 w-8"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-[#00ff9f]" /></th>
                <th className="text-left px-4 py-3">company</th>
                <th className="text-left px-4 py-3">role</th>
                <th className="text-left px-4 py-3">period</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {experience.map((e) => (
                <tr key={e.id} className={`border-b border-border hover:bg-surface/50 ${selectedWork.has(e.id!) ? "bg-accent/5" : ""}`}>
                  <td className="px-4 py-3"><input type="checkbox" checked={selectedWork.has(e.id!)} onChange={() => toggleOne(e.id!)} className="accent-[#00ff9f]" /></td>
                  <td className="px-4 py-3 text-accent">{e.company}</td>
                  <td className="px-4 py-3 text-text-primary">{localized(e.role, displayLocale)}</td>
                  <td className="px-4 py-3 text-muted text-xs">{e.startDate} — {e.endDate ?? "Present"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setWorkForm(toWorkForm(e, locales))} className="text-muted hover:text-accent"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteTarget({ type: "work", id: e.id! })} className="text-muted hover:text-red-400"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {experience.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted text-xs">no entries yet</td></tr>}
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
                <th className="px-4 py-3 w-8"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-[#00ff9f]" /></th>
                <th className="text-left px-4 py-3">institution</th>
                <th className="text-left px-4 py-3">degree</th>
                <th className="text-left px-4 py-3">period</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {education.map((e) => (
                <tr key={e.id} className={`border-b border-border hover:bg-surface/50 ${selectedEdu.has(e.id!) ? "bg-accent/5" : ""}`}>
                  <td className="px-4 py-3"><input type="checkbox" checked={selectedEdu.has(e.id!)} onChange={() => toggleOne(e.id!)} className="accent-[#00ff9f]" /></td>
                  <td className="px-4 py-3 text-accent">{e.institution}</td>
                  <td className="px-4 py-3 text-text-primary">{localized(e.degree, displayLocale)} {localized(e.field, displayLocale)}</td>
                  <td className="px-4 py-3 text-muted text-xs">{e.startDate} — {e.endDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setEduForm(toEduForm(e, locales))} className="text-muted hover:text-accent"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteTarget({ type: "edu", id: e.id! })} className="text-muted hover:text-red-400"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {education.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted text-xs">no entries yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Work row form */}
      {workForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6">
          <div className="bg-surface border border-border w-full max-w-xl p-6 font-mono overflow-y-auto max-h-[90vh]">
            <h2 className="text-accent text-sm mb-4">{workForm.id ? "edit work entry" : "new work entry"}</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-muted mb-1">company</label>
                <input type="text" value={workForm.company} onChange={(e) => setWorkForm({ ...workForm, company: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
              </div>

              <LocalizedInput label="role" value={workForm.role} onChange={(v) => setWorkForm({ ...workForm, role: v })} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">startDate</label>
                  <input type="text" value={workForm.startDate} onChange={(e) => setWorkForm({ ...workForm, startDate: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">endDate (empty = Present)</label>
                  <input type="text" value={workForm.endDate} onChange={(e) => setWorkForm({ ...workForm, endDate: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">location</label>
                <input type="text" value={workForm.location} onChange={(e) => setWorkForm({ ...workForm, location: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
              </div>

              <LocalizedBullets label="bullets" value={workForm.bullets} onChange={(v) => setWorkForm({ ...workForm, bullets: v })} />

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

      {/* Education row form */}
      {eduForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6">
          <div className="bg-surface border border-border w-full max-w-xl p-6 font-mono overflow-y-auto max-h-[90vh]">
            <h2 className="text-accent text-sm mb-4">{eduForm.id ? "edit education entry" : "new education entry"}</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-muted mb-1">institution</label>
                <input type="text" value={eduForm.institution} onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
              </div>

              <LocalizedInput label="degree" value={eduForm.degree} onChange={(v) => setEduForm({ ...eduForm, degree: v })} />
              <LocalizedInput label="field" value={eduForm.field} onChange={(v) => setEduForm({ ...eduForm, field: v })} />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">startDate</label>
                  <input type="text" value={eduForm.startDate} onChange={(e) => setEduForm({ ...eduForm, startDate: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">endDate</label>
                  <input type="text" value={eduForm.endDate} onChange={(e) => setEduForm({ ...eduForm, endDate: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">gpa</label>
                  <input type="text" value={eduForm.gpa} onChange={(e) => setEduForm({ ...eduForm, gpa: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
                </div>
              </div>

              <LocalizedBullets label="notes" value={eduForm.notes} onChange={(v) => setEduForm({ ...eduForm, notes: v })} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={saveEdu} className="flex-1 border border-accent text-accent py-2 text-sm hover:bg-accent hover:text-background transition-colors">save</button>
              <button onClick={() => setEduForm(null)} className="flex-1 border border-border text-muted py-2 text-sm hover:border-accent/40 transition-colors">cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk edit — work */}
      {bulkEdit && tab === "work" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6">
          <div className="bg-surface border border-border w-full max-w-sm p-6 font-mono">
            <h2 className="text-accent text-sm mb-1">bulk edit — work</h2>
            <p className="text-xs text-muted mb-4">{selectedWork.size} entries selected</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-2">end date</label>
                <div className="space-y-2">
                  {(["no-change", "present", "date"] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                      <input type="radio" name="bulkEndDate" value={opt} checked={bulkEndDate === opt} onChange={() => setBulkEndDate(opt)} className="accent-[#00ff9f]" />
                      {opt === "no-change" ? "— no change —" : opt === "present" ? "mark as Present" : "set date:"}
                    </label>
                  ))}
                  {bulkEndDate === "date" && (
                    <input type="text" value={bulkEndDateVal} onChange={(e) => setBulkEndDateVal(e.target.value)} placeholder="e.g. Dec 2024"
                      className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60 mt-1" />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">location (empty = skip)</label>
                <input type="text" value={bulkLocation} onChange={(e) => setBulkLocation(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={applyBulkEdit} className="flex-1 border border-accent text-accent py-2 text-sm hover:bg-accent hover:text-background transition-colors">apply</button>
              <button onClick={() => setBulkEdit(false)} className="flex-1 border border-border text-muted py-2 text-sm hover:border-accent/40 transition-colors">cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk edit — education */}
      {bulkEdit && tab === "education" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6">
          <div className="bg-surface border border-border w-full max-w-sm p-6 font-mono">
            <h2 className="text-accent text-sm mb-1">bulk edit — education</h2>
            <p className="text-xs text-muted mb-4">{selectedEdu.size} entries selected</p>
            <div>
              <label className="block text-xs text-muted mb-1">end date (empty = skip)</label>
              <input type="text" value={bulkEduEndDate} onChange={(e) => setBulkEduEndDate(e.target.value)} placeholder="e.g. 2021"
                className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={applyBulkEdit} className="flex-1 border border-accent text-accent py-2 text-sm hover:bg-accent hover:text-background transition-colors">apply</button>
              <button onClick={() => setBulkEdit(false)} className="flex-1 border border-border text-muted py-2 text-sm hover:border-accent/40 transition-colors">cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && <ConfirmModal message="delete this entry?" onConfirm={confirmRowDelete} onCancel={() => setDeleteTarget(null)} />}
      {bulkDeleteConfirm && <ConfirmModal message={`delete ${activeSelected.size} entries?`} onConfirm={confirmBulkDelete} onCancel={() => setBulkDeleteConfirm(false)} />}
      {toast && <SaveToast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} offsetBottom={activeSelected.size > 0} />}

      <BulkActionBar count={activeSelected.size} onEdit={() => setBulkEdit(true)} onDelete={() => setBulkDeleteConfirm(true)} onClear={clearSelection} />
    </div>
  );
}
