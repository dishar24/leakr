// src/lib/summary.ts
import Groq from "groq-sdk";
import { AuditResult, FormInput } from "./audit";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateSummary(
  input: FormInput,
  result: AuditResult
): Promise<string> {
  const toolList = input.tools
    .map((t) => `${t.id} (${t.plan}, $${t.monthlySpend}/mo)`)
    .join(", ");

  const issues = result.findings
    .filter((f) => f.findingType !== "optimal")
    .map((f) => `${f.toolName}: ${f.findingType} — save $${f.monthlySavings}/mo`)
    .join("; ");

  const prompt = `You are a no-nonsense AI spend analyst writing a brief audit summary for a startup team.

Context:
- Team size: ${input.teamSize}
- Primary use case: ${input.useCase}
- Tools paying for: ${toolList}
- Issues found: ${issues || "none"}
- Total monthly savings available: $${result.totalMonthlySavings}
- Total annual savings available: $${result.totalAnnualSavings}

Write a 80-100 word plain-English summary of their AI spend situation. Be direct and specific — name the actual tools and dollar amounts. Explain the pattern behind the waste (e.g. "growth-stage sprawl", "paying for overlap", "wrong tier for team size"). End with one clear action sentence. No bullet points. No fluff. No filler phrases like "it's important to note". Write like a CFO's advisor, not a chatbot.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.4,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) throw new Error("Empty response from Groq");
    return text;
  } catch (err) {
    console.error("Groq summary failed, using fallback:", err);
    return generateFallbackSummary(input, result);
  }
}

function generateFallbackSummary(input: FormInput, result: AuditResult): string {
  if (result.totalMonthlySavings === 0) {
    return `Your AI stack of ${input.tools.length} tool${input.tools.length !== 1 ? "s" : ""} looks well-optimised for a ${input.teamSize}-person team focused on ${input.useCase}. No significant redundancies or overplans detected. Keep an eye on pricing changes — AI tool costs shift frequently.`;
  }

  const topIssue = result.findings
    .filter((f) => f.findingType !== "optimal")
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  const issueCount = result.findings.filter((f) => f.findingType !== "optimal").length;

  return `Your ${input.teamSize}-person team is spending $${result.totalCurrentSpend}/mo across ${input.tools.length} AI tools with $${result.totalMonthlySavings}/mo going to waste. ${issueCount} issue${issueCount !== 1 ? "s" : ""} found — the biggest being ${topIssue?.toolName} (${topIssue?.findingType}, save $${topIssue?.monthlySavings}/mo). Fixing these cuts your bill to $${result.totalOptimisedSpend}/mo and saves $${result.totalAnnualSavings} annually.`;
}
