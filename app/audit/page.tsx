"use client";
import LeadCaptureModal from "@/components/ui/LeadCaptureModal";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuditResult } from "@/lib/audit";

type FullResult = AuditResult & { 
  aiSummary: string; 
  shareId: string | null 
};

const STORAGE_KEY = "leakr_form_state";

const BADGE_STYLES: Record<string, string> = {
  redundant: "bg-red-500/20 text-red-400 border border-red-500/30",
  overplan: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  "right-size": "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  optimal: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
};

const BADGE_LABELS: Record<string, string> = {
  redundant: "REDUNDANT",
  overplan: "OVERPLAN",
  "right-size": "RIGHT-SIZE",
  optimal: "OPTIMAL",
};

export default function AuditPage() {
  const router = useRouter();
  const [result, setResult] = useState<FullResult | null>(null);
const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    async function fetchAudit() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) { router.push("/"); return; }

        const formState = JSON.parse(saved);

        // Transform localStorage format → API format
        const tools = Object.entries(formState.tools)
          .filter(([, v]: [string, unknown]) => (v as { enabled: boolean }).enabled)
          .map(([id, v]: [string, unknown]) => {
            const tool = v as { plan: string; seats: string; monthlySpend: string };
            return {
              id,
              plan: tool.plan,
              seats: parseInt(tool.seats) || 1,
              monthlySpend: parseFloat(tool.monthlySpend) || 0,
            };
          });

        const res = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tools,
            teamSize: parseInt(formState.teamSize) || 1,
            useCase: formState.useCase || "mixed",
          }),
        });

        if (!res.ok) throw new Error("Audit request failed");
        const data: FullResult = await res.json();
        setResult(data);
      } catch {
        setError("Something went wrong running your audit.");
      } finally {
        setLoading(false);
      }
    }

    fetchAudit();
  }, [router]);
  useEffect(() => {
  if (result) {
    const timer = setTimeout(() => setShowModal(true), 3000);
    return () => clearTimeout(timer);
  }
}, [result]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 glow-green" />
          <p className="text-sm text-slate-300 font-medium">Running your audit...</p>
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-slate-400 mb-4">{error || "No audit data found."}</p>
          <button onClick={() => router.push("/")} className="text-sm underline text-emerald-400 font-medium hover:text-emerald-300">
            Start over
          </button>
        </div>
      </main>
    );
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <main className="min-h-screen bg-[#0a0e1a]">
      <nav className="border-b border-white/10 backdrop-blur-sm bg-[#0a0e1a]/80 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.push("/")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center glow-green-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">leakr</span>
        </button>
        <span className="text-xs text-slate-400 font-semibold">Find where your AI budget bleeds</span>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Savings Section */}
        <div className="mb-12">
          {result.totalMonthlySavings > 0 ? (
            <div className="glass-card rounded-2xl p-8 glow-green mb-8">
              <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-3">
                POTENTIAL MONTHLY SAVINGS
              </p>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-emerald-400 text-6xl font-bold">+{fmt(result.totalMonthlySavings)}</span>
                <span className="text-2xl text-emerald-400/60 font-semibold">/mo</span>
              </div>
              <p className="text-slate-300 text-base mb-6">
                Our AI identified {result.findings.filter((f) => f.findingType !== "optimal").length} optimization opportunities across your stack.
              </p>
              <button className="text-sm text-emerald-400 font-semibold hover:text-emerald-300 transition-colors flex items-center gap-2">
                Execute Optimization →
              </button>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">You&apos;re spending well.</h1>
                  <p className="text-slate-400">
                    No significant savings found. Your stack looks right-sized for your team and use case.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        {result.aiSummary && (
  <div className="glass-card rounded-2xl p-6 mb-8">
    <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">
      AI ANALYSIS
    </p>
    <p className="text-sm text-slate-300 leading-relaxed">
      {result.aiSummary}
    </p>
  </div>
)}

        {/* Overlaps/Redundancy Card - High Priority */}
        {result.redundancyGroups.length > 0 && (
          <div className="glass-card rounded-2xl p-6 mb-8 border-red-500/30 glow-green-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-white">{result.redundancyGroups.length} Overlap{result.redundancyGroups.length !== 1 ? "s" : ""}</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 font-bold uppercase tracking-wider">
                    Duplicate Functionality
                  </span>
                </div>
                {result.redundancyGroups.map((g) => (
                  <p key={g.capability} className="text-sm text-slate-300 mb-2 leading-relaxed">
                    {g.explanation}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Current Monthly", value: fmt(result.totalCurrentSpend), color: "text-slate-300" },
            { label: "Optimized Monthly", value: fmt(result.totalOptimisedSpend), color: "text-emerald-400" },
            { label: "Tools Audited", value: result.findings.length.toString(), color: "text-slate-300" },
            {
              label: "Issues Found",
              value: result.findings.filter((f) => f.findingType !== "optimal").length.toString(),
              color: result.findings.filter((f) => f.findingType !== "optimal").length > 0 ? "text-red-400" : "text-slate-300",
            },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-5">
              <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Per-tool breakdown */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-5">Tool Breakdown</p>
          <div className="space-y-3">
            {result.findings.map((f) => (
              <div key={f.toolId} className="glass-card rounded-xl p-6 hover:glass-card-hover transition-all">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-base font-bold text-white">{f.toolName}</span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold ${BADGE_STYLES[f.findingType]}`}
                      >
                        {BADGE_LABELS[f.findingType]}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mb-3">{f.reasoning}</p>
                    {f.recommendation && f.findingType !== "optimal" && (
                      <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-slate-800/50 border border-white/10">
                        <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <p className="text-sm text-slate-200 font-medium">{f.recommendation}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {f.monthlySavings > 0 ? (
                      <>
                        <p className="text-sm text-slate-500 line-through mb-1">{fmt(f.currentSpend)}/mo</p>
                        <p className="text-xl font-bold text-emerald-400">Save {fmt(f.monthlySavings)}/mo</p>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-slate-300 font-semibold">{fmt(f.currentSpend)}/mo</p>
                        <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credex CTA — only for high savings */}
        {result.highSavings && (
          <div className="glass-card rounded-xl p-6 flex items-center justify-between gap-6 mb-8 border-emerald-500/30">
            <div>
              <p className="text-base font-bold text-white mb-2">
                Capture {fmt(result.totalMonthlySavings)}/mo faster with Credex
              </p>
              <p className="text-sm text-slate-400">
                Discounted AI credits for Claude, Cursor, ChatGPT — same tools, lower cost.
              </p>
            </div>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-sm px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all font-bold glow-green-sm"
            >
              Book a Call
            </a>
          </div>
        )}

        {/* Low savings message */}
        {!result.highSavings && result.totalMonthlySavings < 100 && (
          <div className="glass-card rounded-xl p-6 mb-8">
            <p className="text-base font-bold text-white mb-2">Stay in the loop</p>
            <p className="text-sm text-slate-400">
              Your stack is mostly right-sized now. AI pricing changes fast — get notified when new optimizations apply to your stack.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex-1 py-3.5 text-sm border border-white/10 rounded-xl text-slate-300 hover:bg-slate-800/50 transition-all font-semibold"
          >
            Edit Stack
          </button>
          <button
            onClick={() => {
  const url = result?.shareId
    ? `${window.location.origin}/share/${result.shareId}`
    : window.location.href;
  navigator.clipboard.writeText(url);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}}
            className="flex-1 py-3.5 text-sm border border-white/10 rounded-xl text-slate-300 hover:bg-slate-800/50 transition-all font-semibold"
          >
            {copied ? "Link Copied ✓" : "Share Audit →"}
          </button>
        </div>
      </div>
      {showModal && (
  <LeadCaptureModal
    onClose={() => setShowModal(false)}
    monthlySavings={result.totalMonthlySavings}
    shareId={result.shareId}
  />
)}
    </main>
  );
}
