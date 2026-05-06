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
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setForm(JSON.parse(saved));
    } catch {}
    setLoaded(true);
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
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
        <span className="text-base font-medium tracking-tight text-zinc-900">
          leakr
        </span>
        <span className="text-xs text-zinc-400">
          find where your AI budget bleeds
        </span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-medium text-zinc-900 mb-2">
            audit your AI stack
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            select every tool you pay for. we&apos;ll find the waste, the
            redundancies, and what to cut.
          </p>
        </div>

        {/* Tools */}
        <div className="space-y-3 mb-10">
          <p className="text-xs uppercase tracking-widest text-zinc-400 mb-4">
            your tools
          </p>

          {TOOLS.map((tool) => {
            const entry = form.tools[tool.id];
            return (
              <div
                key={tool.id}
                className={`border rounded-xl transition-all duration-150 ${
                  entry.enabled
                    ? "border-zinc-300 bg-white"
                    : "border-zinc-100 bg-zinc-50"
                }`}
              >
                {/* Tool header row */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                  onClick={() =>
                    setToolField(tool.id, "enabled", !entry.enabled)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        entry.enabled
                          ? "bg-zinc-900 border-zinc-900"
                          : "border-zinc-300 bg-white"
                      }`}
                    >
                      {entry.enabled && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
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
                      className={`text-sm font-medium ${
                        entry.enabled ? "text-zinc-900" : "text-zinc-400"
                      }`}
                    >
                      {tool.name}
                    </span>
                  </div>
                  {entry.enabled && entry.monthlySpend && (
                    <span className="text-xs text-zinc-400">
                      ${entry.monthlySpend}/mo
                    </span>
                  )}
                </div>

                {/* Expanded fields */}
                {entry.enabled && (
                  <div className="px-4 pb-4 grid grid-cols-3 gap-3 border-t border-zinc-100 pt-3">
                    {/* Plan */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-zinc-400">plan</label>
                      <select
                        value={entry.plan}
                        onChange={(e) =>
                          setToolField(tool.id, "plan", e.target.value)
                        }
                        className="text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                      >
                        {tool.plans.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Seats */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-zinc-400">seats</label>
                      <input
                        type="number"
                        min="1"
                        value={entry.seats}
                        onChange={(e) =>
                          setToolField(tool.id, "seats", e.target.value)
                        }
                        placeholder="1"
                        className="text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                      />
                    </div>

                    {/* Monthly spend */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-zinc-400">
                        monthly spend ($)
                      </label>
                      <input
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
                        className="text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Team info */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-zinc-400 mb-4">
            your team
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500">team size</label>
              <input
                type="number"
                min="1"
                value={form.teamSize}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, teamSize: e.target.value }))
                }
                placeholder="e.g. 8"
                className="text-sm border border-zinc-200 rounded-lg px-3 py-2.5 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500">primary use case</label>
              <select
                value={form.useCase}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, useCase: e.target.value }))
                }
                className="text-sm border border-zinc-200 rounded-lg px-3 py-2.5 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"
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
          className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
            canSubmit
              ? "bg-zinc-900 text-white hover:bg-zinc-700 cursor-pointer"
              : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
          }`}
        >
          {canSubmit
            ? `run audit on ${enabledCount} tool${enabledCount !== 1 ? "s" : ""} →`
            : "select at least one tool to continue"}
        </button>

        {enabledCount > 0 && (
          <p className="text-xs text-zinc-400 text-center mt-3">
            form auto-saved · no account needed
          </p>
        )}
      </div>
    </main>
  );
}
