
## AI Summary Prompt

Used in `src/lib/summary.ts` — called after the audit engine runs, generates a ~100 word plain-English summary via Groq (llama-3.3-70b-versatile).

### The prompt

You are a no-nonsense AI spend analyst writing a brief audit summary for a startup team.

Context:
- Team size: {teamSize}
- Primary use case: {useCase}
- Tools paying for: {toolList}
- Issues found: {issues}
- Total monthly savings available: ${totalMonthlySavings}
- Total annual savings available: ${totalAnnualSavings}

Write a 80-100 word plain-English summary of their AI spend situation. Be direct and specific — name the actual tools and dollar amounts. Explain the pattern behind the waste (e.g. "growth-stage sprawl", "paying for overlap", "wrong tier for team size"). End with one clear action sentence. No bullet points. No fluff. No filler phrases like "it's important to note". Write like a CFO's advisor, not a chatbot.


### Why I wrote it this way

**"no-nonsense AI spend analyst"** — sets the persona. Without this, the model defaults to chatbot voice: hedging, filler, excessive caveats. The analyst persona produces direct, confident output.

**"name the actual tools and dollar amounts"** — prevents vague summaries like "you're overspending on some tools." The audit engine already has the specifics; the prompt forces the model to use them.

**"explain the pattern behind the waste"** — this is the differentiator vs the per-tool breakdown. The per-tool cards explain what to do. The summary should explain *why* the problem exists (sprawl, wrong tier, etc). These are different and both valuable.

**"no bullet points"** — the results page already has a structured breakdown. The summary needs to feel like a paragraph of insight, not a duplicate list.

**temperature: 0.4** — low enough to be factual and consistent (no hallucinated numbers), high enough to vary phrasing across different audits.

**max_tokens: 200** — enforces the ~100 word target. Without this constraint the model runs long.

### What I tried that didn't work

**Higher temperature (0.7):** The model occasionally invented savings numbers not in the context. Unacceptable for a financial tool — dropped to 0.4.

**"Write a summary of this audit"** (no persona, no constraints): Produced generic, hedged output. "Based on the information provided, it appears your team may be spending more than necessary..." — useless.

**Asking for bullet points:** Redundant with the per-tool breakdown already on the page. Removed.

### Fallback

If Groq API fails (rate limit, downtime, network error), `generateFallbackSummary()` in `summary.ts` produces a templated string using the audit data directly. No AI dependency — the product works without it.