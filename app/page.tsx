"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "leakr_form_state";

const TOOLS = [
  {
    id: "cursor",
    name: "Cursor",
    plans: ["Hobby", "Pro", "Business", "Enterprise"],
  },
  {
    id: "github_copilot",
    name: "GitHub Copilot",
    plans: ["Individual", "Business", "Enterprise"],
  },
  {
    id: "claude",
    name: "Claude",
    plans: ["Free", "Pro", "Max", "Team", "Enterprise", "API direct"],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    plans: ["Plus", "Team", "Enterprise", "API direct"],
  },
  {
    id: "anthropic_api",
    name: "Anthropic API",
    plans: ["API direct"],
  },
  {
    id: "openai_api",
    name: "OpenAI API",
    plans: ["API direct"],
  },
  {
    id: "gemini",
    name: "Gemini",
    plans: ["Pro", "Ultra", "API"],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    plans: ["Free", "Pro", "Teams"],
  },
];

const USE_CASES = ["coding", "writing", "data", "research", "mixed"];

type ToolEntry = {
  enabled: boolean;
  plan: string;
  seats: string;
  monthlySpend: string;
};

type FormState = {
  tools: Record<string, ToolEntry>;
  teamSize: string;
  useCase: string;
};

function getDefaultState(): FormState {
  const tools: Record<string, ToolEntry> = {};
  TOOLS.forEach((t) => {
    tools[t.id] = {
      enabled: false,
      plan: t.plans[0],
      seats: "1",
      monthlySpend: "",
    };
  });
  return { tools, teamSize: "", useCase: "mixed" };
}

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(getDefaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadSavedForm = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsedForm = JSON.parse(saved);
          setForm(parsedForm);
        }
      } catch {
        // Ignore parse errors
      }
      setLoaded(true);
    };
    
    loadSavedForm();
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    }
  }, [form, loaded]);

  function setToolField(
    id: string,
    field: keyof ToolEntry,
    value: string | boolean
  ) {
    setForm((prev) => ({
      ...prev,
      tools: {
        ...prev.tools,
        [id]: { ...prev.tools[id], [field]: value },
      },
    }));
  }

  const enabledCount = Object.values(form.tools).filter((t) => t.enabled).length;

  function handleSubmit() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    router.push("/audit");
  }

  const canSubmit =
    enabledCount > 0 &&
    form.teamSize !== "" &&
    Object.entries(form.tools)
      .filter(([, v]) => v.enabled)
      .every(([, v]) => v.monthlySpend !== "");

  if (!loaded) return null;

  return (
    <main className="min-h-screen bg-[#0a0e1a]">
      {/* Nav */}
      <nav className="border-b border-white/10 backdrop-blur-sm bg-[#0a0e1a]/80 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center glow-green-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            leakr
          </span>
        </div>
        <span className="text-base text-slate-400 font-semibold">
          Find where your AI budget bleeds
        </span>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
            Audit your AI stack
          </h1>
          <p className="text-base text-slate-400 leading-relaxed">
            Select every tool you pay for. We&apos;ll find the waste, the
            redundancies, and what to cut.
          </p>
        </div>

        {/* Tools */}
        <div className="space-y-3 mb-12">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-5">
            Your Tools
          </p>

          {TOOLS.map((tool) => {
            const entry = form.tools[tool.id];
            return (
              <div
                key={tool.id}
                className={`rounded-xl transition-all duration-200 ${
                  entry.enabled
                    ? "glass-card-hover glow-green-sm"
                    : "glass-card hover:border-white/20"
                }`}
              >
                {/* Tool header row */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
                  onClick={() =>
                    setToolField(tool.id, "enabled", !entry.enabled)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        entry.enabled
                          ? "bg-emerald-500 border-emerald-500 glow-green-sm"
                          : "border-slate-600 bg-slate-800/50"
                      }`}
                    >
                      {entry.enabled && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 10 10"
                        >
                          <path
                            d="M1.5 5L4 7.5L8.5 2.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        entry.enabled ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {tool.name}
                    </span>
                  </div>
                  {entry.enabled && entry.monthlySpend && (
                    <span className="text-sm font-bold text-emerald-400">
                      ${entry.monthlySpend}/mo
                    </span>
                  )}
                </div>

                {/* Expanded fields */}
                {entry.enabled && (
                  <div className="px-5 pb-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                    {/* Plan */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor={`plan-${tool.id}`} className="text-xs text-slate-400 font-medium uppercase tracking-wider">Plan</label>
                      <select
                        id={`plan-${tool.id}`}
                        name={`plan-${tool.id}`}
                        value={entry.plan}
                        onChange={(e) =>
                          setToolField(tool.id, "plan", e.target.value)
                        }
                        className="text-sm border border-white/10 rounded-lg px-3 py-2.5 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                      >
                        {tool.plans.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Seats */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor={`seats-${tool.id}`} className="text-xs text-slate-400 font-medium uppercase tracking-wider">Seats</label>
                      <input
                        id={`seats-${tool.id}`}
                        name={`seats-${tool.id}`}
                        type="number"
                        min="1"
                        value={entry.seats}
                        onChange={(e) =>
                          setToolField(tool.id, "seats", e.target.value)
                        }
                        placeholder="1"
                        className="text-sm border border-white/10 rounded-lg px-3 py-2.5 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                      />
                    </div>

                    {/* Monthly spend */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor={`monthlySpend-${tool.id}`} className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                        Monthly ($)
                      </label>
                      <input
                        id={`monthlySpend-${tool.id}`}
                        name={`monthlySpend-${tool.id}`}
                        type="number"
                        min="0"
                        value={entry.monthlySpend}
                        onChange={(e) =>
                          setToolField(
                            tool.id,
                            "monthlySpend",
                            e.target.value
                          )
                        }
                        placeholder="0"
                        className="text-sm border border-white/10 rounded-lg px-3 py-2.5 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Team info */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-5">
            Your Team
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="teamSize" className="text-xs text-slate-400 font-medium uppercase tracking-wider">Team Size</label>
              <input
                id="teamSize"
                name="teamSize"
                type="number"
                min="1"
                value={form.teamSize}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, teamSize: e.target.value }))
                }
                placeholder="e.g. 8"
                className="text-sm border border-white/10 rounded-lg px-4 py-3 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="useCase" className="text-xs text-slate-400 font-medium uppercase tracking-wider">Primary Use Case</label>
              <select
                id="useCase"
                name="useCase"
                value={form.useCase}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, useCase: e.target.value }))
                }
                className="text-sm border border-white/10 rounded-lg px-4 py-3 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              >
                {USE_CASES.map((uc) => (
                  <option key={uc} value={uc}>
                    {uc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-4 rounded-xl text-sm font-bold transition-all ${
            canSubmit
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 glow-green cursor-pointer"
              : "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-white/10"
          }`}
        >
          {canSubmit
            ? `Run Audit on ${enabledCount} Tool${enabledCount !== 1 ? "s" : ""} →`
            : "Select at least one tool to continue"}
        </button>

        {enabledCount > 0 && (
          <p className="text-xs text-slate-500 text-center mt-4 font-medium">
            Form auto-saved · No account needed
          </p>
        )}
      </div>
    </main>
  );
}
