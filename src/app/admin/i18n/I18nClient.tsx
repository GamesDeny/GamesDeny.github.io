"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import type { Locale } from "@/i18n";
import SaveToast from "@/components/admin/ui/SaveToast";
import { Plus, X, ClipboardPaste, Save } from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────

function flattenJSON(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((acc, [key, val]) => {
    const full = prefix ? `${prefix}.${key}` : key;
    if (typeof val === "object" && val !== null) {
      Object.assign(acc, flattenJSON(val as Record<string, unknown>, full));
    } else {
      acc[full] = String(val);
    }
    return acc;
  }, {});
}

interface NewLocale {
  code: string;
  data: Record<string, string>;
  pasteOpen: boolean;
  pasteText: string;
}

// ─── component ────────────────────────────────────────────────────────────────

export default function I18nClient({ locales }: Readonly<{ locales: Locale[] }>) {
  const [allData, setAllData] = useState<Record<string, Record<string, string>>>({});
  const [keys, setKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newLocale, setNewLocale] = useState<NewLocale | null>(null);
  const [missingOnly, setMissingOnly] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") =>
    setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    const results = await Promise.all(
      locales.map(async (l) => {
        const res = await fetch(`/api/admin/i18n?locale=${l}`);
        return [l, res.ok ? ((await res.json()) as Record<string, string>) : {}] as [
          string,
          Record<string, string>,
        ];
      })
    );
    const data: Record<string, Record<string, string>> = {};
    for (const [l, d] of results) data[l] = d;
    setAllData(data);
    const base = results.find(([l]) => l === "en") ?? results[0];
    setKeys(base ? Object.keys(base[1]) : []);
    setLoading(false);
  }, [locales]);

  useEffect(() => {
    load();
  }, [load]);

  // ── save ────────────────────────────────────────────────────────────────────

  const saveLocale = async (locale: string, data: Record<string, string>) => {
    setSaving(locale);
    const res = await fetch("/api/admin/i18n", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, data }),
    });
    setSaving(null);
    showToast(res.ok ? `${locale} saved` : "save failed", res.ok ? "success" : "error");
  };

  const saveNew = async () => {
    if (!newLocale?.code.trim()) return;
    await saveLocale(newLocale.code.trim(), newLocale.data);
    setNewLocale(null);
    load();
  };

  // ── paste ───────────────────────────────────────────────────────────────────

  const applyPaste = () => {
    if (!newLocale) return;
    try {
      const parsed = JSON.parse(newLocale.pasteText) as Record<string, unknown>;
      const flat = flattenJSON(parsed);
      setNewLocale({ ...newLocale, data: flat, pasteOpen: false, pasteText: "" });
    } catch {
      showToast("invalid JSON", "error");
    }
  };

  // ── groups ──────────────────────────────────────────────────────────────────

  const isMissing = (key: string) =>
    locales.some((l) => !allData[l]?.[key]?.trim()) ||
    (newLocale !== null && !newLocale.data[key]?.trim());

  const missingCount = keys.filter(isMissing).length;

  const visibleKeys = missingOnly ? keys.filter(isMissing) : keys;

  const groups = visibleKeys.reduce<Record<string, string[]>>((acc, key) => {
    const g = key.split(".")[0];
    (acc[g] ??= []).push(key);
    return acc;
  }, {});

  const totalCols = locales.length + 2; // key col + locales + new-locale col

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="pb-16">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-accent text-sm mb-1">&gt; admin / i18n</p>
          <h1 className="text-2xl font-bold text-text-primary">translations</h1>
        </div>
        {!loading && (
          <button
            onClick={() => setMissingOnly((v) => !v)}
            className={`flex items-center gap-2 border px-4 py-2 text-sm font-mono transition-colors ${
              missingOnly
                ? "border-red-400 text-red-400 bg-red-400/10"
                : "border-border text-muted hover:border-accent/40 hover:text-text-primary"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${missingOnly ? "bg-red-400" : "bg-muted"}`} />
            missing only
            {missingCount > 0 && (
              <span className="ml-1 text-xs opacity-70">({missingCount})</span>
            )}
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-muted text-sm font-mono">loading...</p>
      ) : (
        <div className="border border-border overflow-x-auto">
          <table className="text-sm font-mono" style={{ minWidth: `${(locales.length + 1) * 260 + 256}px` }}>
            <thead className="bg-surface border-b border-border text-xs">
              <tr>
                {/* key column */}
                <th className="text-left px-4 py-3 w-64 text-muted">key</th>

                {/* existing locale columns */}
                {locales.map((l) => (
                  <th key={l} className="text-left px-4 py-3 min-w-[260px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="uppercase text-accent tracking-widest">{l}</span>
                      <button
                        onClick={() => saveLocale(l, allData[l] ?? {})}
                        disabled={saving === l}
                        className="flex items-center gap-1 border border-accent text-accent px-2 py-1 text-xs hover:bg-accent hover:text-background transition-colors disabled:opacity-40"
                      >
                        <Save size={11} />
                        {saving === l ? "saving…" : "save"}
                      </button>
                    </div>
                  </th>
                ))}

                {/* new locale column */}
                {newLocale ? (
                  <th className="text-left px-4 py-3 min-w-[260px] align-top">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="text"
                          placeholder="code (e.g. fr)"
                          value={newLocale.code}
                          onChange={(e) => setNewLocale({ ...newLocale, code: e.target.value })}
                          className="w-24 bg-background border border-border px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent/60"
                        />
                        <button
                          onClick={() =>
                            setNewLocale({ ...newLocale, pasteOpen: !newLocale.pasteOpen })
                          }
                          className="flex items-center gap-1 border border-border text-muted px-2 py-1 text-xs hover:border-accent/40 hover:text-text-primary transition-colors"
                        >
                          <ClipboardPaste size={11} /> paste
                        </button>
                        <button
                          onClick={saveNew}
                          disabled={!newLocale.code.trim() || saving === newLocale.code}
                          className="flex items-center gap-1 border border-accent text-accent px-2 py-1 text-xs hover:bg-accent hover:text-background transition-colors disabled:opacity-40"
                        >
                          <Save size={11} /> save
                        </button>
                        <button
                          onClick={() => setNewLocale(null)}
                          className="text-muted hover:text-red-400 transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                      {newLocale.pasteOpen && (
                        <div className="flex flex-col gap-1">
                          <textarea
                            rows={5}
                            placeholder={'paste JSON — flat or nested:\n{"hero.title": "..."}\nor\n{"hero": {"title": "..."}}'}
                            value={newLocale.pasteText}
                            onChange={(e) =>
                              setNewLocale({ ...newLocale, pasteText: e.target.value })
                            }
                            className="w-full bg-background border border-border px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent/60 resize-none font-mono"
                          />
                          <button
                            onClick={applyPaste}
                            className="self-end border border-accent text-accent px-2 py-1 text-xs hover:bg-accent hover:text-background transition-colors"
                          >
                            apply
                          </button>
                        </div>
                      )}
                    </div>
                  </th>
                ) : (
                  <th className="px-4 py-3">
                    <button
                      onClick={() =>
                        setNewLocale({ code: "", data: {}, pasteOpen: false, pasteText: "" })
                      }
                      className="flex items-center gap-1 border border-border text-muted px-3 py-1.5 text-xs hover:border-accent/40 hover:text-text-primary transition-colors whitespace-nowrap"
                    >
                      <Plus size={11} /> add locale
                    </button>
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {Object.entries(groups).map(([group, groupKeys]) => (
                <Fragment key={group}>
                  {/* group header row */}
                  <tr className="bg-surface/40">
                    <td
                      colSpan={totalCols}
                      className="px-4 py-2 text-xs text-accent uppercase tracking-widest border-b border-border"
                    >
                      {group}
                    </td>
                  </tr>

                  {/* key rows */}
                  {groupKeys.map((key) => (
                    <tr key={key} className="border-b border-border hover:bg-surface/30">
                      <td className="px-4 py-2 text-muted text-xs truncate max-w-[256px]" title={key}>
                        {key}
                      </td>

                      {locales.map((l) => (
                        <td key={l} className="px-4 py-2">
                          <input
                            type="text"
                            value={allData[l]?.[key] ?? ""}
                            onChange={(e) =>
                              setAllData((prev) => ({
                                ...prev,
                                [l]: { ...prev[l], [key]: e.target.value },
                              }))
                            }
                            className="w-full bg-background border border-border px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent/60"
                          />
                        </td>
                      ))}

                      {newLocale && (
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={newLocale.data[key] ?? ""}
                            onChange={(e) =>
                              setNewLocale({
                                ...newLocale,
                                data: { ...newLocale.data, [key]: e.target.value },
                              })
                            }
                            className="w-full bg-background border border-border px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent/60"
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <SaveToast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}
