// src/lib/audit.ts
// Leakr audit engine — hardcoded rules, no AI here (intentional)

export type ToolId =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolInput = {
  id: ToolId;
  plan: string;
  seats: number;
  monthlySpend: number;
};

export type FormInput = {
  tools: ToolInput[];
  teamSize: number;
  useCase: UseCase;
};

export type FindingType = "overplan" | "redundant" | "right-size" | "optimal";

export type ToolFinding = {
  toolId: ToolId;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  findingType: FindingType;
  recommendation: string;
  suggestedPlan?: string;
  suggestedSpend?: number;
  monthlySavings: number;
  reasoning: string;
};

export type AuditResult = {
  findings: ToolFinding[];
  totalCurrentSpend: number;
  totalOptimisedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  redundancyGroups: RedundancyGroup[];
  highSavings: boolean; // true if >$500/mo savings
};

export type RedundancyGroup = {
  capability: string;
  tools: ToolId[];
  explanation: string;
};

// ─── Pricing reference (verified May 2026) ───────────────────────────────────
// Sources in PRICING_DATA.md
const OFFICIAL_PRICING: Record<ToolId, Record<string, number>> = {
  cursor: {
    Hobby: 0,
    Pro: 20,
    "Pro+": 60,
    Ultra: 200,
    Teams: 40, // per seat
    Enterprise: 40, // per seat, custom
  },
  github_copilot: {
    Free: 0,
    Pro: 10,
    "Pro+": 19,
    Business: 19, // per seat
    Enterprise: 39, // per seat
  },
  claude: {
    Free: 0,
    Pro: 20,
    "Max 5x": 100,
    "Max 20x": 200,
    "Team Standard": 25, // per seat monthly
    "Team Premium": 125, // per seat monthly
    Enterprise: 0, // custom
    "API direct": 0, // variable
  },
  chatgpt: {
    Free: 0,
    Plus: 20,
    Pro: 200,
    Team: 30, // per seat
    Enterprise: 0, // custom
    "API direct": 0, // variable
  },
  anthropic_api: {
    "API direct": 0, // variable — user enters actual spend
  },
  openai_api: {
    "API direct": 0, // variable — user enters actual spend
  },
  gemini: {
    Free: 0,
    "AI Pro": 20,
    "AI Ultra": 250,
    "API direct": 0,
  },
  windsurf: {
    Free: 0,
    Pro: 15,
    Teams: 30, // per seat
    Enterprise: 0,
  },
};

const TOOL_NAMES: Record<ToolId, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  anthropic_api: "Anthropic API",
  openai_api: "OpenAI API",
  gemini: "Gemini",
  windsurf: "Windsurf",
};

// Which tools overlap in capability for which use cases
const REDUNDANCY_MAP: {
  capability: string;
  tools: ToolId[];
  useCases: UseCase[];
}[] = [
  {
    capability: "AI code editor / inline completion",
    tools: ["cursor", "github_copilot", "windsurf"],
    useCases: ["coding", "mixed"],
  },
  {
    capability: "General-purpose LLM chat",
    tools: ["claude", "chatgpt", "gemini"],
    useCases: ["writing", "research", "mixed", "data", "coding"],
  },
  {
    capability: "Anthropic model access",
    tools: ["claude", "anthropic_api"],
    useCases: ["coding", "writing", "data", "research", "mixed"],
  },
  {
    capability: "OpenAI model access",
    tools: ["chatgpt", "openai_api"],
    useCases: ["coding", "writing", "data", "research", "mixed"],
  },
];

// ─── Main audit function ──────────────────────────────────────────────────────

export function runAudit(input: FormInput): AuditResult {
  const findings: ToolFinding[] = [];
  const activeToolIds = input.tools.map((t) => t.id);

  // Detect redundancy groups first — we need this context for per-tool advice
  const redundancyGroups = detectRedundancies(activeToolIds, input.useCase);
  const redundantToolIds = new Set(
    redundancyGroups.flatMap((g) => g.tools)
  );

  for (const tool of input.tools) {
    const finding = evaluateTool(tool, input, redundantToolIds, redundancyGroups);
    findings.push(finding);
  }

  const totalCurrentSpend = findings.reduce((s, f) => s + f.currentSpend, 0);
  const totalOptimisedSpend = findings.reduce(
    (s, f) => s + (f.suggestedSpend ?? f.currentSpend),
    0
  );
  const totalMonthlySavings = totalCurrentSpend - totalOptimisedSpend;
  const totalAnnualSavings = totalMonthlySavings * 12;

  return {
    findings,
    totalCurrentSpend,
    totalOptimisedSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    redundancyGroups,
    highSavings: totalMonthlySavings > 500,
  };
}

// ─── Per-tool evaluation ──────────────────────────────────────────────────────

function evaluateTool(
  tool: ToolInput,
  input: FormInput,
  redundantToolIds: Set<ToolId>,
  redundancyGroups: RedundancyGroup[]
): ToolFinding {
  const base: Omit<ToolFinding, "findingType" | "recommendation" | "reasoning" | "monthlySavings" | "suggestedPlan" | "suggestedSpend"> = {
    toolId: tool.id,
    toolName: TOOL_NAMES[tool.id],
    currentPlan: tool.plan,
    currentSpend: tool.monthlySpend,
  };

  // 0. Check for pricing mismatch (user entered wrong price for known plans)
  const pricingIssue = checkPricingMismatch(tool, input);
  if (pricingIssue) return pricingIssue;

  // 1. Check if this tool is redundant
  if (redundantToolIds.has(tool.id)) {
    const group = redundancyGroups.find((g) => g.tools.includes(tool.id) && g.tools.length > 1);
    if (group) {
      // find the cheapest tool in the redundancy group the user is paying for
      const groupTools = input.tools.filter((t) => group.tools.includes(t.id));
      const cheapest = groupTools.reduce((a, b) =>
        a.monthlySpend <= b.monthlySpend ? a : b
      );

      if (tool.id !== cheapest.id) {
        return {
          ...base,
          findingType: "redundant",
          recommendation: `Drop ${TOOL_NAMES[tool.id]} — ${TOOL_NAMES[cheapest.id]} already covers ${group.capability} for your team.`,
          suggestedPlan: "Cancel",
          suggestedSpend: 0,
          monthlySavings: tool.monthlySpend,
          reasoning: `You're paying for ${group.tools.map((id) => TOOL_NAMES[id]).join(" + ")} — all provide ${group.capability}. Consolidating to ${TOOL_NAMES[cheapest.id]} eliminates $${tool.monthlySpend}/mo with no capability loss for your ${input.useCase} use case.`,
        };
      }
    }
  }

  // 2. Check for overplan (too many seats or wrong tier)
  const overplanFinding = checkOverplan(tool, input);
  if (overplanFinding) return overplanFinding;

  // 3. Check for right-sizing opportunities (cheaper plan fits)
  const rightsizeFinding = checkRightsize(tool, input);
  if (rightsizeFinding) return rightsizeFinding;

  // 4. Optimal - provide specific reasoning based on context
  return {
    ...base,
    findingType: "optimal",
    recommendation: "No changes recommended — this spend looks right for your usage.",
    monthlySavings: 0,
    reasoning: generateOptimalReasoning(tool, input),
  };
}

// ─── Pricing mismatch check ───────────────────────────────────────────────────

function checkPricingMismatch(tool: ToolInput, _input: FormInput): ToolFinding | null {
  const { id, plan, monthlySpend } = tool;
  const name = TOOL_NAMES[id];
  
  // Get official pricing for this tool/plan combo
  const officialPrice = OFFICIAL_PRICING[id]?.[plan];
  
  // Skip API direct plans (variable pricing)
  if (plan === "API direct" || officialPrice === undefined) return null;
  
  // For free/hobby plans, official price should be 0
  if (officialPrice === 0 && monthlySpend > 0) {
    return {
      toolId: id,
      toolName: name,
      currentPlan: plan,
      currentSpend: monthlySpend,
      findingType: "overplan",
      recommendation: `${name} ${plan} is free — you shouldn't be paying anything.`,
      suggestedPlan: plan,
      suggestedSpend: 0,
      monthlySavings: monthlySpend,
      reasoning: `${name} ${plan} plan is completely free. You entered $${monthlySpend}/mo, but the official price is $0. Either you're on a different plan, or there's a billing error. Verify your subscription.`,
    };
  }
  
  // For paid plans, check if user is overpaying significantly (>20% over official)
  if (officialPrice > 0 && monthlySpend > officialPrice * 1.2) {
    const expectedSpend = officialPrice * tool.seats;
    if (monthlySpend > expectedSpend * 1.2) {
      return {
        toolId: id,
        toolName: name,
        currentPlan: plan,
        currentSpend: monthlySpend,
        findingType: "overplan",
        recommendation: `Verify your ${name} billing — you're paying significantly more than the official ${plan} price.`,
        suggestedPlan: plan,
        suggestedSpend: expectedSpend,
        monthlySavings: monthlySpend - expectedSpend,
        reasoning: `${name} ${plan} officially costs $${officialPrice}/seat. For ${tool.seats} seat(s), you should pay ~$${expectedSpend}/mo, but you entered $${monthlySpend}/mo. Check for duplicate subscriptions, legacy pricing, or billing errors.`,
      };
    }
  }
  
  return null;
}

// ─── Generate contextual optimal reasoning ────────────────────────────────────

function generateOptimalReasoning(tool: ToolInput, input: FormInput): string {
  const { id, plan, monthlySpend, seats } = tool;
  const name = TOOL_NAMES[id];
  const { teamSize, useCase } = input;
  
  // Coding tools
  if (id === "cursor" || id === "github_copilot" || id === "windsurf") {
    if (useCase === "coding" || useCase === "mixed") {
      if (seats === teamSize) {
        return `${name} ${plan} at $${monthlySpend}/mo covers your entire ${teamSize}-person dev team. The plan tier matches your team size and coding-focused workflow — no obvious waste here.`;
      } else if (seats < teamSize) {
        return `${name} ${plan} for ${seats}/${teamSize} developers at $${monthlySpend}/mo. Partial coverage is intentional — you're likely equipping your most active coders. Spend looks deliberate.`;
      } else {
        return `${name} ${plan} at $${monthlySpend}/mo for ${seats} seat(s). Your team size is ${teamSize}, so you have extra capacity — but if contractors or future hires are planned, this is fine.`;
      }
    }
  }
  
  // Chat tools
  if (id === "claude" || id === "chatgpt" || id === "gemini") {
    if (plan.includes("Pro") || plan.includes("Plus") || plan.includes("Max")) {
      return `${name} ${plan} at $${monthlySpend}/mo for individual power users. This tier makes sense if you're hitting usage limits regularly on ${useCase} tasks. No cheaper alternative delivers the same capacity.`;
    } else if (plan.includes("Team")) {
      return `${name} ${plan} at $${monthlySpend}/mo for ${seats} seat(s). Team plans add collaboration features and higher limits — appropriate for ${teamSize}-person teams doing ${useCase} work at scale.`;
    } else if (plan === "Free") {
      return `${name} Free plan — you're not paying anything, so there's nothing to optimize. If you hit limits, consider upgrading, but for now this is perfect.`;
    }
  }
  
  // API plans
  if (plan === "API direct") {
    return `${name} API at $${monthlySpend}/mo. API spend is usage-based and hard to optimize without knowing your traffic patterns. If this is production load, it's likely appropriate. Monitor for unexpected spikes.`;
  }
  
  // Generic fallback with actual context
  if (monthlySpend === 0) {
    return `${name} ${plan} is free. No spend to optimize — you're getting full value at zero cost.`;
  }
  
  return `${name} ${plan} at $${monthlySpend}/mo aligns with your ${teamSize}-person team's ${useCase} workflow. The plan tier and seat count match your stated usage — no clear downgrade path without losing capability.`;
}

// ─── Overplan check ───────────────────────────────────────────────────────────

function checkOverplan(tool: ToolInput, input: FormInput): ToolFinding | null {
  const { id, plan, seats, monthlySpend, } = tool;
  const name = TOOL_NAMES[id];

  // Cursor: Teams for tiny teams
  if (id === "cursor" && plan === "Teams" && seats <= 2) {
    const proSavings = monthlySpend - seats * 20;
    if (proSavings > 0) {
      return {
        toolId: id, toolName: name, currentPlan: plan, currentSpend: monthlySpend,
        findingType: "overplan",
        recommendation: `Switch ${seats} seat(s) to Cursor Pro — Teams plan admin features unused at this size.`,
        suggestedPlan: "Pro (per seat)",
        suggestedSpend: seats * 20,
        monthlySavings: proSavings,
        reasoning: `Cursor Teams at $40/seat adds centralised billing and admin controls — unnecessary for ${seats} developer(s). Pro at $20/seat covers all AI features. Saves $${proSavings}/mo.`,
      };
    }
  }

  // GitHub Copilot: Business for 1-2 users
  if (id === "github_copilot" && plan === "Business" && seats <= 2) {
    const proSavings = monthlySpend - seats * 10;
    if (proSavings > 0) {
      return {
        toolId: id, toolName: name, currentPlan: plan, currentSpend: monthlySpend,
        findingType: "overplan",
        recommendation: `Downgrade to Copilot Pro — Business plan org features are overkill for ${seats} user(s).`,
        suggestedPlan: "Pro",
        suggestedSpend: seats * 10,
        monthlySavings: proSavings,
        reasoning: `Copilot Business at $19/seat adds policy controls for organisations. At ${seats} user(s) this is wasted spend. Pro at $10/seat delivers identical AI capability. Saves $${proSavings}/mo.`,
      };
    }
  }

  // ChatGPT Team for 1-3 users where Plus works
  if (id === "chatgpt" && plan === "Team" && seats <= 3 && input.useCase !== "data") {
    const plusCost = seats * 20;
    const savings = monthlySpend - plusCost;
    if (savings > 0) {
      return {
        toolId: id, toolName: name, currentPlan: plan, currentSpend: monthlySpend,
        findingType: "overplan",
        recommendation: `Switch to ChatGPT Plus per user — Team plan collaboration features unused at ${seats} seat(s).`,
        suggestedPlan: "Plus (per user)",
        suggestedSpend: plusCost,
        monthlySavings: savings,
        reasoning: `ChatGPT Team at $30/seat adds shared workspace, admin console, and higher limits. For ${seats} user(s) on a ${input.useCase} use case, Plus at $20/user covers the same AI capability. Saves $${savings}/mo.`,
      };
    }
  }

  // Claude Team Premium for small non-engineering teams
  if (id === "claude" && plan === "Team Premium" && seats <= 3 && input.useCase === "writing") {
    const standardCost = seats * 25;
    const savings = monthlySpend - standardCost;
    if (savings > 0) {
      return {
        toolId: id, toolName: name, currentPlan: plan, currentSpend: monthlySpend,
        findingType: "overplan",
        recommendation: `Downgrade to Claude Team Standard — Claude Code not needed for writing use case.`,
        suggestedPlan: "Team Standard",
        suggestedSpend: standardCost,
        monthlySavings: savings,
        reasoning: `Claude Team Premium at $125/seat includes Claude Code for developers. Your team's primary use is writing — Team Standard at $25/seat covers all chat, Projects, and collaboration features. Saves $${savings}/mo.`,
      };
    }
  }

  return null;
}

// ─── Right-size check ─────────────────────────────────────────────────────────

function checkRightsize(tool: ToolInput, input: FormInput): ToolFinding | null {
  const { id, plan, monthlySpend } = tool;
  const name = TOOL_NAMES[id];

  // Claude Max when Pro might suffice (light teams, non-coding)
  if (id === "claude" && (plan === "Max 5x" || plan === "Max 20x")) {
    if (input.teamSize <= 3 && input.useCase === "writing") {
      const savings = monthlySpend - 20;
      return {
        toolId: id, toolName: name, currentPlan: plan, currentSpend: monthlySpend,
        findingType: "right-size",
        recommendation: "Try Claude Pro for a month — Max tier is for daily power users hitting limits.",
        suggestedPlan: "Pro",
        suggestedSpend: 20,
        monthlySavings: savings,
        reasoning: `Claude Max (${plan}) is designed for developers and researchers exhausting Pro limits daily. For a ${input.teamSize}-person writing team, Pro at $20/mo provides high usage limits adequate for most workflows. Downgrade and monitor — upgrade back if you hit limits. Saves $${savings}/mo.`,
      };
    }
  }

  // ChatGPT Pro ($200) when Plus suffices
  if (id === "chatgpt" && plan === "Pro" && input.useCase !== "coding" && input.useCase !== "data") {
    const savings = monthlySpend - 20;
    if (savings > 0) {
      return {
        toolId: id, toolName: name, currentPlan: plan, currentSpend: monthlySpend,
        findingType: "right-size",
        recommendation: "Downgrade to ChatGPT Plus — $200 Pro is for users who need o1 Pro mode daily.",
        suggestedPlan: "Plus",
        suggestedSpend: 20,
        monthlySavings: savings,
        reasoning: `ChatGPT Pro at $200/mo is designed for researchers and engineers requiring unlimited o1 Pro mode and advanced reasoning. For ${input.useCase} use cases, Plus at $20 provides GPT-4o access with adequate limits. Saves $${savings}/mo unless you're hitting Pro-specific features daily.`,
      };
    }
  }

  // Windsurf Pro when free tier might suffice for occasional use
  if (id === "windsurf" && plan === "Pro" && input.useCase === "writing") {
    return {
      toolId: id, toolName: name, currentPlan: plan, currentSpend: monthlySpend,
      findingType: "right-size",
      recommendation: "Consider cancelling Windsurf Pro — it's a coding tool, not useful for writing.",
      suggestedPlan: "Cancel or Free",
      suggestedSpend: 0,
      monthlySavings: monthlySpend,
      reasoning: `Windsurf is an AI code editor. Your team's primary use case is ${input.useCase} — there's no meaningful capability Windsurf adds over Claude or ChatGPT for this workflow. Saves $${monthlySpend}/mo.`,
    };
  }

  return null;
}

// ─── Redundancy detection ─────────────────────────────────────────────────────

function detectRedundancies(
  activeToolIds: ToolId[],
  useCase: UseCase
): RedundancyGroup[] {
  const groups: RedundancyGroup[] = [];

  for (const map of REDUNDANCY_MAP) {
    if (!map.useCases.includes(useCase)) continue;

    const overlap = map.tools.filter((t) => activeToolIds.includes(t));
    if (overlap.length >= 2) {
      groups.push({
        capability: map.capability,
        tools: overlap,
        explanation: `${overlap.map((id) => TOOL_NAMES[id]).join(" and ")} both provide ${map.capability}. For a ${useCase} use case, you only need one.`,
      });
    }
  }

  return groups;
}
