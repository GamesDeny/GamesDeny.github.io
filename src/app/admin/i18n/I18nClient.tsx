"use client";

import { useState, useEffect, useCallback } from "react";
import type { Locale } from "@/i18n";
import SaveToast from "@/components/admin/ui/SaveToast";

export default function I18nClient({ locales }: { locales: Locale[] }) {
  const [locale, setLocale] = useState<Locale>(locales[0]);
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const load = useCallback(async (l: Locale) => {
    setLoading(true);
    const res = await fetch(`/api/admin/i18n?locale=${l}`);
    if (res.ok) setEntries(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(locale); }, [locale, load]);

  const save = async () => {
    const res = await fetch("/api/admin/i18n", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, data: entries }),
    });
    setToast(res.ok
      ? { msg: `${locale} saved`, type: "success" }
      : { msg: "save failed", type: "error" }
    );
  };

  // Group keys by their first segment (e.g. "hero", "nav")
  const groups = Object.entries(entries).reduce<Record<string, [string, string][]>>(
    (acc, [key, val]) => {
      const group = key.split(".")[0];
      (acc[group] ??= []).push([key, val]);
      return acc;
    }, {}
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-accent text-sm mb-1">&gt; admin / i18n</p>
          <h1 className="text-2xl font-bold text-text-primary">translations</h1>
        </div>
        <button onClick={save} className="border border-accent text-accent px-4 py-2 text-sm hover:bg-accent hover:text-background transition-colors font-mono">
          save {locale}
        </button>
      </div>

      {/* Locale tabs */}
      <div className="flex gap-0 mb-8 border border-border w-fit">
        {locales.map((l) => (
          <button key={l} onClick={() => setLocale(l)}
            className={`px-5 py-2 text-sm font-mono uppercase transition-colors ${locale === l ? "bg-accent text-background" : "text-muted hover:text-text-primary"}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted text-sm font-mono">loading...</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(groups).map(([group, rows]) => (
            <div key={group}>
              <p className="text-xs text-accent font-mono uppercase tracking-widest mb-3 border-b border-border pb-2">{group}</p>
              <div className="space-y-3">
                {rows.map(([key, val]) => (
                  <div key={key} className="flex gap-4 items-start">
                    <label className="text-xs text-muted font-mono pt-2.5 w-48 shrink-0 truncate" title={key}>{key}</label>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => setEntries({ ...entries, [key]: e.target.value })}
                      className="flex-1 bg-background border border-border px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <SaveToast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
