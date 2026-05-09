"use client";

import { useState } from "react";

type Props = {
  onClose: () => void;
  monthlySavings: number;
  shareId: string | null;
};

export default function LeadCaptureModal({ onClose, monthlySavings, shareId }: Props) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [honeypot, setHoneypot] = useState(""); // abuse protection
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  async function handleSubmit() {
    if (!email.trim()) return;
    if (honeypot) return; // bot detected, silently ignore

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          company: company.trim(),
          role: role.trim(),
          shareId,
          monthlySavings,
          honeypot,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setDone(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-card rounded-2xl p-7 border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {done ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Report sent!</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Check your inbox for the full audit breakdown.
              {monthlySavings > 500 && " Our team will reach out about saving even more with Credex."}
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full py-2.5 text-sm border border-white/10 rounded-xl text-slate-300 hover:bg-slate-800/50 transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-1">
                {monthlySavings > 0
                  ? `Get your full report — save ${fmt(monthlySavings)}/mo`
                  : "Get your audit report"}
              </h3>
              <p className="text-sm text-slate-400">
                We&apos;ll email you the full breakdown.
                {monthlySavings > 500 && " High savings detected — Credex will reach out too."}
              </p>
            </div>

            <div className="space-y-3">
              {/* Honeypot — hidden from real users */}
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-500">work email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-white/25"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-500">company <span className="text-slate-600">(optional)</span></label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Inc."
                  className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-white/25"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-500">role <span className="text-slate-600">(optional)</span></label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-white/25"
                >
                  <option value="" className="bg-zinc-900">Select role...</option>
                  <option value="founder" className="bg-zinc-900">Founder / Co-founder</option>
                  <option value="cto" className="bg-zinc-900">CTO / VP Engineering</option>
                  <option value="engineering_manager" className="bg-zinc-900">Engineering Manager</option>
                  <option value="developer" className="bg-zinc-900">Developer</option>
                  <option value="finance" className="bg-zinc-900">Finance / Operations</option>
                  <option value="other" className="bg-zinc-900">Other</option>
                </select>
              </div>

              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!email.trim() || loading}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all mt-1 ${
                  email.trim() && !loading
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
                    : "bg-white/5 text-slate-600 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Email me the report →"
                )}
              </button>

              <p className="text-xs text-slate-600 text-center">
                no spam · unsubscribe anytime
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
