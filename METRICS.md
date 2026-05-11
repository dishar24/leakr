# METRICS.md

## North Star Metric

**High-savings audits completed per week** (audits where total monthly savings > $500)

### Why this and not something else

- **Not DAU** — people use Leakr once per quarter when they review spend. DAU would always look terrible and mean nothing.
- **Not total audits** — a flood of $0-savings audits doesn't help Credex. Volume without quality is noise.
- **Not emails captured** — a vanity metric. Someone can submit a fake email.
- **Not revenue** — Leakr is free.Revenue matters eventually, but at this stage Leakr's job is generating qualified pipeline for Credex.

High-savings audits are the metric because they correlate directly with Credex pipeline. Every audit showing >$500/mo in waste is a warm lead worth following up on. If this number is growing week over week, everything else follows.

---

## 3 Input Metrics That Drive the North Star

**1. Visitor → audit completion rate**
Target: ≥40%
Why it matters: If people land and leave without completing the form, the product isn't explaining its value fast enough. This metric catches UX problems on the form page.

**2. % of completed audits flagged as high-savings**
Target: ≥15%
Why it matters: If too few audits surface real savings, either our targeting is wrong (wrong users finding the tool) or our audit engine is too conservative. This is the quality signal.

**3. Shareable URL click-through rate**
Target: ≥10% of completed audits generate a share
Why it matters: Shares are the organic growth engine. Each share is a free impression with a rich OG preview. If nobody shares, the viral loop is broken and growth requires constant top-of-funnel effort.

---

## What to Instrument First

In order of priority:

1. **Audit completion event** — fire when `/api/audit` returns 200. Track: tools selected, use case, team size, total savings found, high/low savings flag.
2. **Lead capture event** — fire when `/api/leads` returns 200. Track: email submitted, monthly savings at time of capture, role selected.
3. **Share URL generated** — fire when shareId is created. Track: savings amount on shared audit.
4. **Share URL visited** — fire when `/share/[id]` is loaded. Track: referrer, time since audit was created.
5. **Credex CTA clicked** — fire when "book a call" button is clicked.This is the closest proxy to real business value.

Tools: Start with Vercel Analytics (free, already available) for page views. Add a simple events table in Supabase for custom events. No need for a paid analytics tool at this stage.

---

## What Number Triggers a Pivot Decision

**If after 4 weeks:**
- High-savings audit rate < 5% → the audit engine is miscalibrated or wrong users are finding the tool. Pivot: tighten targeting or revisit pricing data.
- Visitor → audit completion < 20% → the form is too long or the value prop isn't clear enough on landing. Pivot: shorten the form or rewrite the hero.
- Zero Credex consultations booked from leads → the handoff from Leakr to Credex is broken. Pivot: change the CTA, improve the email copy, or have Credex reach out manually.
- Share rate stays below 2% → the shareable URL feature isn't working as a growth loop. Pivot: make the share card more visually striking or add an incentive to share.

The single number that would trigger a full rethink: **if 500 audits are completed and zero Credex consultations are booked.** That would mean Leakr is generating value for users but none for Credex — the fundamental premise of the tool as a lead-gen asset would be broken.