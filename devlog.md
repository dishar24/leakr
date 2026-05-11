## Day 1 — 2025-05-06
**Hours worked:** 1
**What I did:** Initialised Next.js 14 + TypeScript + Tailwind + shadcn. Built spend input form with all 8 tools, plan/seats/spend fields, and localStorage persistence.
**What I learned:** Next.js app router structure, shadcn setup, and basic state persistence with localStorage.
**Blockers / what I'm stuck on:** Button submit logic and audit calculations still need implementation.
**Plan for tomorrow:** Build the audit engine — hardcoded rules, pricing data, PRICING_DATA.md

## Day 2 — 2026-05-07
**Hours worked:** 3
**What I did:** Built the audit engine with redundancy, overplan, and right-size detection. Added API route, results page, pricing validation, and 7 passing tests. Redesigned the UI into a dark dashboard style.
**What I learned:** AI pricing models change frequently, so pricing validation and separation of logic/UI are important.
**Blockers / what I'm stuck on:** Need database integration and better analytics visuals.
**Plan for tomorrow:** Add Supabase shareable audit URLs and continue UI polish.


## Day 3 — 2026-05-08

**Hours worked:** ~2-3h

**What I did:**
- Added Groq AI summaries
- Connected Supabase storage
- Built shareable audit pages
- Added share/copy audit feature
- Improved audit UI

**What I learned:**
- Dynamic routes in Next.js
- Env variable setup
- Git commit workflow
- API debugging

**Blockers:**
- `.env.local` setup
- Share route issues
- Git push conflicts

**Plan for tomorrow:**
- Build lead capture form
- Add Resend transactional email
- Improve onboarding flow

# Day 4 — 2026-05-09

**Hours worked:** 2h

**What I did:**  
Built lead capture modal that appears after audit results load (value first, ask second flow). Added POST `/api/leads` endpoint with honeypot abuse protection, in-memory rate limiting (3 req/min/IP), Supabase lead storage, and Resend transactional email integration. Wired modal into audit results page and tested successful lead submission flow locally.

**What I learned:**  
Learned how Next.js API routes work with POST requests, how to connect Supabase + Resend into a production-style flow, and how lead funnels are implemented in SaaS products. Also learned debugging around API routes, environment variables, and external service integration.

**Blockers:**  
Resend emails initially failed due to incorrect API route placement and Supabase URL typo. Fixed routing structure and environment config issues after debugging terminal logs.

**Plan for tomorrow:**  
Set up GitHub Actions CI, deploy to Vercel, configure production environment variables, test live lead flow, and run Lighthouse audit.

## Day 5 — 2026-05-10

**Hours worked:** 4.5h

**What I did:** Fixed all lint errors by adding proper TypeScript types and removing unused variables. Deployed to Vercel with all environment variables. Debugged Supabase 403 error — fixed by disabling RLS on audits and leads tables. Fixed share page 404 by awaiting params in Next.js 14 App Router. Added vitest to devDependencies so CI could find the test runner. Set up GitHub Actions CI — lint + tests now run on every push to main, showing green. Ran Lighthouse on deployed URL: Performance 88, Accessibility 96, Best Practices 100, SEO 100 — all passing credex requirements.

**What I learned:** Next.js 14 App Router requires params to be awaited in server components — params is now a Promise, not a plain object. Supabase RLS blocks all requests by default even with correct keys. Resend free tier only delivers to verified domain owner email.

**Blockers / what I'm stuck on:** Resend email only delivers to my own registered email on free tier — noted as MVP tradeoff, full delivery needs custom domain in production.

**Plan for tomorrow:** Write all entrepreneurial files (GTM, ECONOMICS, USER_INTERVIEWS, LANDING_COPY, METRICS, REFLECTION, ARCHITECTURE, README) and submit.

## Day 6 — 2026-05-11

**Hours worked:** 5

**What I did:**  
Finished most of the non-code deliverables for the assignment. Wrote ECONOMICS.md, GTM.md, METRICS.md, LANDING_COPY.md, and updated README.md with deployment instructions and decisions/tradeoffs. Recorded a short Loom walkthrough showing the full audit flow, lead capture modal, and shared audit URL. Also cleaned up the repo structure so all required markdown files are at the repo root.

**What I learned:**  
The entrepreneurial/documentation side of the project took longer than expected. Writing realistic GTM and economics assumptions was harder than writing the actual UI. I also learned that showing tradeoffs and limitations honestly makes the project feel more believable than pretending everything is production-perfect.

**Blockers / what I'm stuck on:**  
Resend free tier only allows sending emails to verified addresses, so the transactional email demo flow is limited during testing. Documented this limitation in the repo instead of trying to hack around it.



