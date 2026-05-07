"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuditResult } from "@/lib/audit";

const STORAGE_KEY = "leakr_form_state";

const BADGE_STYLES: Record<string, string> = {
  redundant: "bg-red-50 text-red-700",
  overplan: "bg-orange-50 text-orange-700",
  "right-size": "bg-yellow-50 text-yellow-700",
  optimal: "bg-green-50 text-green-700",
};

const BADGE_LABELS: Record<string, string> = {
  redundant: "redundant",
  overplan: "overplan",
  "right-size": "right-size",
  optimal: "optimal",
};

export default function AuditPage() {
  const router = useRouter();
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAudit() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) { router.push("/"); return; }

        const formState = JSON.parse(saved);

        // Transform localStorage format → API format
        const tools = Object.entries(formState.tools)
          .filter(([, v]: [string, any]) => v.enabled)
          .map(([id, v]: [string, any]) => ({
            id,
            plan: v.plan,
            seats: parseInt(v.seats) || 1,
            monthlySpend: parseFloat(v.monthlySpend) || 0,
          }));

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
        const data: AuditResult = await res.json();
        setResult(data);
      } catch (e) {
        setError("Something went wrong running your audit.");
      } finally {
        setLoading(false);
      }
    }

    fetchAudit();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-zinc-500">running your audit...</p>
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-zinc-500 mb-4">{error || "No audit data found."}</p>
          <button onClick={() => router.push("/")} className="text-sm underline text-zinc-600">
            start over
          </button>
        </div>
      </main>
    );
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="text-base font-medium tracking-tight text-zinc-900">
          leakr
        </button>
        <span className="text-xs text-zinc-400">find where your AI budget bleeds</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-10">
          {result.totalMonthlySavings > 0 ? (
            <>
              <p className="text-xs text-zinc-400 mb-2">audit complete</p>
              <h1 className="text-2xl font-medium text-zinc-900 mb-2">
                Your AI stack is leaking{" "}
                <span className="text-emerald-600">{fmt(result.totalMonthlySavings)}/mo</span>
              </h1>
              <p className="text-sm text-zinc-500">
                That&apos;s{" "}
                <strong className="font-medium text-zinc-800">{fmt(result.totalAnnualSavings)}/year</strong>{" "}
                — here&apos;s where it&apos;s going.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-zinc-400 mb-2">audit complete</p>
              <h1 className="text-2xl font-medium text-zinc-900 mb-2">You&apos;re spending well.</h1>
              <p className="text-sm text-zinc-500">
                No significant savings found. Your stack looks right-sized for your team and use case.
              </p>
            </>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { label: "current monthly", value: fmt(result.totalCurrentSpend) },
            { label: "optimised monthly", value: fmt(result.totalOptimisedSpend), highlight: true },
            { label: "tools audited", value: result.findings.length.toString() },
            {
              label: "issues found",
              value: result.findings.filter((f) => f.findingType !== "optimal").length.toString(),
            },
          ].map((s) => (
            <div key={s.label} className="bg-zinc-50 rounded-xl p-4">
              <p className="text-xs text-zinc-400 mb-1">{s.label}</p>
              <p className={`text-xl font-medium ${s.highlight ? "text-emerald-600" : "text-zinc-900"}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Per-tool breakdown */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-zinc-400 mb-4">per-tool breakdown</p>
          <div className="border border-zinc-100 rounded-xl overflow-hidden divide-y divide-zinc-100">
            {result.findings.map((f) => (
              <div key={f.toolId} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-zinc-900">{f.toolName}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md ${BADGE_STYLES[f.findingType]}`}
                      >
                        {BADGE_LABELS[f.findingType]}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{f.reasoning}</p>
                    {f.recommendation && f.findingType !== "optimal" && (
                      <p className="text-xs text-zinc-700 mt-1.5 font-medium">→ {f.recommendation}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {f.monthlySavings > 0 ? (
                      <>
                        <p className="text-xs text-zinc-400 line-through">{fmt(f.currentSpend)}/mo</p>
                        <p className="text-sm font-medium text-emerald-600">save {fmt(f.monthlySavings)}/mo</p>
                      </>
                    ) : (
                      <p className="text-sm text-zinc-400">{fmt(f.currentSpend)}/mo ✓</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Redundancy callout */}
        {result.redundancyGroups.length > 0 && (
          <div className="mb-10 border border-orange-100 bg-orange-50 rounded-xl p-5">
            <p className="text-xs font-medium text-orange-700 mb-2 uppercase tracking-widest">
              redundancies detected
            </p>
            {result.redundancyGroups.map((g) => (
              <p key={g.capability} className="text-sm text-orange-800 mb-1 leading-relaxed">
                {g.explanation}
              </p>
            ))}
          </div>
        )}

        {/* Credex CTA — only for high savings */}
        {result.highSavings && (
          <div className="mb-10 border border-zinc-200 rounded-xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-900 mb-1">
                capture {fmt(result.totalMonthlySavings)}/mo faster with Credex
              </p>
              <p className="text-xs text-zinc-500">
                Discounted AI credits for Claude, Cursor, ChatGPT — same tools, lower cost.
              </p>
            </div>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              book a call
            </a>
          </div>
        )}

        {/* Low savings message */}
        {!result.highSavings && result.totalMonthlySavings < 100 && (
          <div className="mb-10 border border-zinc-100 rounded-xl p-5">
            <p className="text-sm font-medium text-zinc-900 mb-1">stay in the loop</p>
            <p className="text-xs text-zinc-500">
              Your stack is mostly right-sized now. AI pricing changes fast — get notified when new optimisations apply to your stack.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex-1 py-2.5 text-sm border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            edit stack
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "Leakr audit", url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="flex-1 py-2.5 text-sm border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            share audit →
          </button>
        </div>
      </div>
    </main>
  );
}
