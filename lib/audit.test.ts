// src/lib/audit.test.ts
import { describe, test, expect } from "vitest";
import { runAudit, FormInput } from "./audit";

// ─── Test 1: Redundancy detection — coding tools ──────────────────────────────
test("detects Cursor + Copilot + Windsurf as redundant for coding use case", () => {
  const input: FormInput = {
    tools: [
      { id: "cursor", plan: "Pro", seats: 1, monthlySpend: 20 },
      { id: "github_copilot", plan: "Pro", seats: 1, monthlySpend: 10 },
      { id: "windsurf", plan: "Pro", seats: 1, monthlySpend: 15 },
    ],
    teamSize: 1,
    useCase: "coding",
  };

  const result = runAudit(input);
  expect(result.redundancyGroups.length).toBeGreaterThan(0);
  expect(result.totalMonthlySavings).toBeGreaterThan(0);
  // Should recommend keeping cheapest, dropping others
  const redundantFindings = result.findings.filter((f) => f.findingType === "redundant");
  expect(redundantFindings.length).toBeGreaterThanOrEqual(1);
});

// ─── Test 2: Claude + Anthropic API double-pay ────────────────────────────────
test("detects Claude subscription + Anthropic API as redundant Anthropic access", () => {
  const input: FormInput = {
    tools: [
      { id: "claude", plan: "Pro", seats: 1, monthlySpend: 20 },
      { id: "anthropic_api", plan: "API direct", seats: 1, monthlySpend: 150 },
    ],
    teamSize: 2,
    useCase: "mixed",
  };

  const result = runAudit(input);
  const redundancyGroup = result.redundancyGroups.find((g) =>
    g.tools.includes("claude") && g.tools.includes("anthropic_api")
  );
  expect(redundancyGroup).toBeDefined();
});

// ─── Test 3: Overplan — Cursor Teams for 2 users ─────────────────────────────
test("flags Cursor Teams plan as overplan for 2 users", () => {
  const input: FormInput = {
    tools: [
      { id: "cursor", plan: "Teams", seats: 2, monthlySpend: 80 }, // 2 * $40
    ],
    teamSize: 2,
    useCase: "coding",
  };

  const result = runAudit(input);
  const finding = result.findings.find((f) => f.toolId === "cursor");
  expect(finding?.findingType).toBe("overplan");
  expect(finding?.monthlySavings).toBe(40); // $80 - (2 * $20)
});

// ─── Test 4: Optimal spend — no false positives ───────────────────────────────
test("marks Claude Pro as optimal for a solo writing user", () => {
  const input: FormInput = {
    tools: [
      { id: "claude", plan: "Pro", seats: 1, monthlySpend: 20 },
    ],
    teamSize: 1,
    useCase: "writing",
  };

  const result = runAudit(input);
  const finding = result.findings.find((f) => f.toolId === "claude");
  expect(finding?.findingType).toBe("optimal");
  expect(finding?.monthlySavings).toBe(0);
});

// ─── Test 5: highSavings flag triggers at >$500 ───────────────────────────────
test("sets highSavings true when monthly savings exceed $500", () => {
  const input: FormInput = {
    tools: [
      { id: "cursor", plan: "Pro", seats: 1, monthlySpend: 20 },
      { id: "github_copilot", plan: "Pro", seats: 1, monthlySpend: 10 },
      { id: "windsurf", plan: "Pro", seats: 1, monthlySpend: 15 },
      { id: "claude", plan: "Max 20x", seats: 1, monthlySpend: 200 },
      { id: "chatgpt", plan: "Pro", seats: 1, monthlySpend: 200 },
      { id: "anthropic_api", plan: "API direct", seats: 1, monthlySpend: 300 },
    ],
    teamSize: 1,
    useCase: "coding",
  };

  const result = runAudit(input);
  expect(result.totalMonthlySavings).toBeGreaterThan(500);
  expect(result.highSavings).toBe(true);
});

// ─── Test 6: Annual savings = monthly * 12 ───────────────────────────────────
test("annual savings is exactly 12x monthly savings", () => {
  const input: FormInput = {
    tools: [
      { id: "cursor", plan: "Teams", seats: 2, monthlySpend: 80 },
    ],
    teamSize: 2,
    useCase: "coding",
  };

  const result = runAudit(input);
  expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
});

// ─── Test 7: ChatGPT Team overplan for 2 users ───────────────────────────────
test("flags ChatGPT Team as overplan for 2 users on writing use case", () => {
  const input: FormInput = {
    tools: [
      { id: "chatgpt", plan: "Team", seats: 2, monthlySpend: 60 }, // 2 * $30
    ],
    teamSize: 2,
    useCase: "writing",
  };

  const result = runAudit(input);
  const finding = result.findings.find((f) => f.toolId === "chatgpt");
  expect(finding?.findingType).toBe("overplan");
  expect(finding?.monthlySavings).toBeGreaterThan(0);
});
