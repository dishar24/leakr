# REFLECTION.md

## 1. The hardest bug I hit this week, and how I debugged it

The hardest bug was a chain of deployment issues around the public share page. Locally everything worked fine, but on production the share URLs returned 404s even though audits were being created successfully.

My first hypothesis was that the environment variables were wrong on Vercel. I checked them - the URL and anon key looked correct. I redeployed. Still failing.

Second hypothesis: the Supabase URL was missing the `https://` prefix. I checked -it was there. Still failing.

Third hypothesis: Supabase had updated their API key format. I noticed they now have "Publishable" and "Secret" keys instead of the old anon/service_role keys. I tried switching to the new publishable key. Still failing.

What actually fixed it: there turned out to be two separate issues. First, Row Level Security on the Supabase table was blocking inserts from the deployed app. I fixed that by updating the table policies in the Supabase SQL editor. But even after audits were saving correctly, the public share page still returned 404s.

The second issue was in the Next.js dynamic route itself. In Next.js 15, async route params need to be awaited before use. The page was querying Supabase with `params.id` directly instead of awaiting `params` first, so every lookup failed and triggered `notFound()` even though the audit rows existed in the database.

The lesson: deployment bugs are often multiple smaller issues stacked together. I initially assumed there was one root cause, but debugging each layer separately — database writes, routing, and query logic — is what eventually solved it.

---

## 2. A decision I reversed mid-week, and what made me reverse it

I originally built the results page with a white minimal UI — clean zinc backgrounds, black text, very Linear-esque. It looked professional in isolation but when I actually ran it in the browser it felt sterile. "Giving cold" was the phrase that came to mind. Everything was the same weight, nothing had hierarchy and the hero savings number didn't hit the way it should.

I reversed the decision on Day 2 and switched to a dark UI with a deep navy background and emerald green accents. The savings number suddenly felt impactful. The badges (redundant, overplan, optimal) popped. The overall feel shifted from "internal tool" to "product someone would screenshot and share."

What made me reverse it: I showed it to myself as a user, not as a builder. When I imagined being a founder who just found out they're wasting $480/month, the white version didn't match the emotional weight of that moment. The dark version did.

---

## 3. What I would build in week 2 if I had it

Three things in priority order:

**Benchmark mode** — "your AI spend per developer is $X, companies your size average $Y." Right now Leakr tells you what to cut. Benchmark mode tells you where you stand relative to peers. This is the feature that makes the tool shareable beyond just the savings number — nobody wants to share "I'm saving $30/mo" but they will share "my team spends 40% less on AI than average for our size."

**PDF export** — a one-click PDF of the full audit report that a founder can drop into a board deck or send to their CFO. The existing shareable URL is good for social but a PDF is what gets actioned in a finance review.

**Usage-based audit inputs** — right now the form only asks what you pay, not how much you use each tool. If I knew someone had 10 Cursor seats but only 3 active users in the last 30 days, the redundancy detection would be dramatically more accurate. This requires an integration layer (OAuth with tool providers) which is a week 2+ feature.

---

## 4. How I used AI tools

I used Claude (Sonnet 4.6) extensively throughout the week as a coding partner, not a code generator.Also used Chatgpt and Kiro. 

**What I used it for:**
- Scaffolding the audit engine logic and talking through the redundancy detection approach before writing code
- Debugging the Supabase 403 error -I described the symptoms and we worked through hypotheses together
- Writing first drafts of all markdown files (GTM, ECONOMICS, REFLECTION etc) which I then edited heavily
- Generating the Groq prompt and iterating on it based on output quality
- Kiro was used to help fix most of the lint errors.
-Chatgpt was used for debugging deployment issues and in understanding supabase/resend issues.

**What I didn't trust it with:**
- The actual pricing data in PRICING_DATA.md - I verified every number against official vendor pages myself. AI training data goes stale and pricing changes constantly.
- The user interview writeups -those came from real conversations. I wrote the summaries myself.
- Final decisions on product direction -Claude suggested things, I decided what to actually build.

**One specific time the AI was wrong and I caught it:**
Claude initially suggested using `NEXT_PUBLIC_SUPABASE_ANON_KEY` as the environment variable name in the Supabase client. But the code it generated read `process.env.SUPABASE_ANON_KEY` — without the `NEXT_PUBLIC_` prefix. This would have worked server-side but broken any client-side Supabase calls. I caught it when reviewing the supabase.ts file before pushing, and corrected the variable name to be consistent.

---

## 5. Self-rating

**Discipline: 7/10**
I started on time and committed every day across at least 5 distinct calendar days. I didn't cram everything into the last 2 days. Where I lost points: some days the commits were thin - a devlog entry rather than meaningful feature work. I could have front-loaded more of the engineering.

**Code quality: 7/10**
The audit engine is clean, well-typed, and testable. The API routes are sensible. Where I lost points: I used `any` types in a few places under time pressure, lint errors existed that needed fixing on Day 5, and some components got long without being broken into smaller pieces.

**Design sense: 8/10**
The UI went through one major pivot (white to dark) and came out significantly better for it. Lighthouse accessibility score of 96 and SEO of 100 suggest the fundamentals are solid. The results page looks like something you'd screenshot. Lost a point because the form page could use more visual hierarchy.

**Problem-solving: 8/10**
Debugged the Supabase RLS issue, the Next.js 14 params awaiting issue and the Resend domain verification limitation - all without prior experience with these specific problems. Formed hypotheses, tested them, moved on when they didn't work. Lost points for time spent on env var debugging that turned out to be a different issue entirely.

**Entrepreneurial thinking: 7/10**
I thought about the product as a lead-gen asset for Credex from day one, not just as a coding exercise. The shareable URL viral loop, the honest "you're spending well" message for low-savings audits and the Credex CTA only showing for high-savings cases these were deliberate product decisions. Lost points because I didn't do the user interviews early enough in the week to let them actually influence the design more.