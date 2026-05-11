# Leakr — find where your AI budget bleeds

Leakr is a free AI spend audit tool for startup founders and engineering managers. You input what AI tools your team pays for, and Leakr surfaces redundancies, overplans, and exact savings — with the math to back it up.

**Live:** https://leakr-chi.vercel.app  
**Built for:** Credex Web Development Intern Assignment — Round 1

---

## Demo

Loom walkthrough: https://www.loom.com/share/8c0aea92a7d04329bbb9e8dce68fe106

---

## Quick Start

### Run locally

```bash
git clone https://github.com/dishar24/leakr.git
cd leakr
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_key
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
npm run dev
```

Open http://localhost:3000

### Run tests

```bash
npm test
```

### Deploy

Push to `main` → Vercel auto-deploys. Add environment variables in Vercel dashboard under Settings → Environment Variables.

---

## Decisions

**1. Hardcoded audit rules, not AI**
The audit engine (`src/lib/audit.ts`) uses hardcoded logic — not an LLM — to evaluate tool spend. This was intentional. AI-generated financial recommendations are unpredictable and hard to verify. A finance person should be able to read the reasoning and agree with it. Hardcoded rules with cited pricing data are more defensible than LLM output for this use case. AI is used only for the summary paragraph, where creativity adds value without risking bad math.

**2. Dark UI over white minimal**
Started with a white minimal design (Linear-esque). Switched to dark after seeing it in the browser — the hero savings number didn't have emotional impact on white. The product moment ("you're wasting $480/month") deserved a UI that matched its weight. Dark background with emerald accents made the savings number hit harder.

**3. Next.js over React + Vite**
Next.js gave us API routes (no separate Express server), server-side rendering for OG tags on the share page, and zero-config Vercel deployment. The share page's rich link previews require server-side meta tag generation — this would have been significantly more complex with a pure client-side React app.

**4. Supabase over Firebase**
Supabase gives us a proper PostgreSQL database with UUID primary keys and a clean REST client. Firebase's document model would have made the audit result structure harder to query. UUID primary keys for shareable URLs mean IDs can't be sequentially enumerated.

**5. Modal for lead capture, not a separate page**
The assignment required email captured after value is shown, never before. A modal with a 3-second delay after the results page loads ensures the user sees their savings number first. A separate page would have broken the flow and felt like a gate.