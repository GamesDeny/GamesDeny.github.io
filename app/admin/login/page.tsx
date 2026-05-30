"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 font-mono">
      <div className="w-full max-w-sm border border-border bg-surface p-8">
        <p className="text-accent text-sm mb-1">&gt; admin access</p>
        <h1 className="text-2xl font-bold text-text-primary mb-8">login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1">
              password<input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60 transition-colors"
                autoFocus
              />
            </label>
          </div>

          {error && (
            <p className="text-xs text-red-400 font-mono">{/* access denied */}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-accent text-accent px-4 py-2 text-sm hover:bg-accent hover:text-background transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "..." : "enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
