"use client";

// src/app/share/[id]/SharePageClient.tsx
import { useRouter } from "next/navigation";

const BADGE: Record<string, string> = {
  redundant: "bg-red-500/15 text-red-400 border border-red-500/20",
  overplan: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
  "right-size": "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  optimal: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
};

export default function SharePageClient({ result }: { result: any }) {
  const router = useRouter();
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <nav className="px-6 py-5 flex items-center justify-between border-b border-white/5">
        <button onClick={() => router.push("/")} className="text-lg font-semibold tracking-tight">
          leakr
        </button>
        <span className="text-xs text-zinc-600">find where your AI budget bleeds</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Shared badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/8 rounded-full px-3 py-1 mb-8">
          <span className="text-xs text-zinc-400">shared audit · email + company redacted</span>
        </div>

        {/* Hero */}
        <div className="mb-10">
          <p className="text-xs text-zinc-600 mb-3 uppercase tracking-widest">audit result</p>
          {result.totalMonthlySavings > 0 ? (
            <>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
                this stack is leaking{" "}
                <span className="text-emerald-400">{fmt(result.totalMonthlySavings)}/mo</span>
              </h1>
              <p className="text-sm text-zinc-400">
                that's{" "}
                <span className="text-white font-medium">{fmt(result.totalAnnualSavings)}/year</span>
              </p>
            </>
          ) : (
            <h1 className="text-3xl font-semibold tracking-tight">this stack is well-optimised.</h1>
          )}
        </div>

        {/* AI summary */}
        {result.aiSummary && (
          <div className="mb-10 bg-white/[0.03] border border-white/8 rounded-xl p-5">
            <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3">ai analysis</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{result.aiSummary}</p>
          </div>
        )}

        {/* Breakdown */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-zinc-600 mb-4">per-tool breakdown</p>
          <div className="border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
            {result.findings.map((f: any) => (
              <div key={f.toolId} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">{f.toolName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md ${BADGE[f.findingType]}`}>
                      {f.findingType}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{f.reasoning}</p>
                </div>
                <div className="text-right shrink-0">
                  {f.monthlySavings > 0 ? (
                    <p className="text-sm font-semibold text-emerald-400">save {fmt(f.monthlySavings)}/mo</p>
                  ) : (
                    <p className="text-sm text-zinc-600">✓</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white/[0.03] border border-white/8 rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white mb-1">audit your own stack</p>
            <p className="text-xs text-zinc-500">free · instant · no account needed</p>
          </div>
          <button onClick={() => router.push("/")}
            className="shrink-0 text-xs px-4 py-2 bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-100 transition-colors">
            run audit →
          </button>
        </div>
      </div>
    </main>
  );
}