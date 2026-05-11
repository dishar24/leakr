# USER_INTERVIEWS.md

Three conversations conducted via LinkedIn DM between May 8–10, 2026.
Outreach sent to 16 people; 3 responded with substantive answers.

---

## Interview 1 — Samhita P.
**Role:** Software Engineer  
**Company:** Mphasis (mid-large enterprise, IT services)  
**Source:** LinkedIn DM  
**Date:** May 8, 2026  

**Summary:**  
Samhita works at Mphasis where the primary AI tool is Microsoft Copilot, adopted org-wide because the company's entire ecosystem is tied to Microsoft. She noted that individual employees have no visibility into what the company actually spends on AI tools — budget is handled centrally by procurement, not by engineers or managers. She felt the team uses Copilot "reasonably well" but flagged that the biggest pain point is unclear enterprise pricing and bundled plans that make it impossible to know what you're actually paying for.

**Direct quotes:**
- "At Mphasis we mainly use Microsoft Copilot since our ecosystem is tied to Microsoft"
- "Not sure about the exact spend since it's handled org-wide"
- "Biggest issue is unclear enterprise pricing and bundled plans"

**Most surprising thing:**  
She had zero visibility into her company's AI spend despite being an active user of the tools. The budget decision was made at a procurement level she had no access to. I expected engineers to at least know roughly what their tools cost but she genuinely didn't.

**What it changed about my design:**  
Made it clear that Leakr's primary target is not large enterprises where spend is invisible to individuals. The real user is a founder or engineering manager at a startup or scale-up who actually controls their own tool budget and can act on the recommendations. Also reinforced why the results page needs to surface actionable next steps not just numbers.

---

## Interview 2 — Ajay H.M.
**Role:** Engineer (open to work)  
**Company:** Early-stage / small team  
**Source:** LinkedIn DM  
**Date:** May 8, 2026  

**Summary:**  
Ajay's team uses only free AI tools -Claude free tier and Antigravity and spends nothing on AI subscriptions. Their philosophy is to keep overhead low during the early stage and only move to paid tools when the need becomes unavoidable. When asked if a free audit tool would be useful if they ever moved to paid plans, he said he could see the value for larger teams but wasn't there yet personally.

**Direct quotes:**
- "Our team use free AI tools like Claude and Antigravity, we not spend any money for this AI tool"
- "We're sticking to free tools for now to keep overhead low, but I can see how that would be valuable for larger teams"
- "My advice is to go with free tools in early days of your learning"

**Most surprising thing:**  
He recommended I use free tools too essentially giving product feedback from outside the target user segment. It clarified that Leakr is not for teams at this stage. The product becomes much more valuable once teams have crossed into paying for multiple tools and lost track of what they're spending.

**What it changed about my design:**  
Added a note on the results page for low-spend audits: "Your stack looks right-sized" rather than manufacturing fake savings. Also considering adding a minimum spend threshold prompt on the form — if someone enters $0 across all tools, Leakr should acknowledge they're not the target user yet rather than showing an empty audit.

---

## Interview 3 — Gopala Krishna V.
**Role:** DevOps Engineer / Volunteer  
**Company:** Organisation using proprietary internal systems  
**Source:** LinkedIn DM  
**Date:** May 9, 2026  

**Summary:**  
Gopala's team doesn't use any mainstream AI tools at all not ChatGPT, Claude or Gemini. The reason: their codebase uses a private, custom programming language that public AI models have never been trained on, making them effectively useless for their workflow. He acknowledged that AI tools are widely used elsewhere but noted that for his team, the tools simply "don't know what we do."

**Direct quotes:**
- "We use private systems and our own custom language which AI tools such as GPT/Claude/Gemini doesn't know"
- "So our team doesn't use or rely on AI tools"
- "To use it, it should know the stuff right, since it doesn't know what we do, can't use it"

**Most surprising thing:**  
This was the most unexpected response of all three interviews. I assumed everyone in tech uses at least some AI tools but there's an entire segment of teams working with proprietary or domain-specific systems where public AI tools are genuinely irrelevant, not just underutilised. It had nothing to do with cost or awareness.

**What it changed about my design:**  
Made the target audience clearer. The product is explicitly for teams using mainstream commercial AI tools (Cursor, Claude, ChatGPT, Copilot, Gemini, Windsurf). Teams with fully proprietary stacks are out of scope and that's okay. The form already covers the right tools. This interview confirmed we shouldn't try to serve everyone.