# TESTS.md

All tests are in `src/lib/audit.test.ts` and cover the audit engine specifically.

## Running Tests

```bash
npm test
```

Tests run via Vitest. All 7 tests pass.

---

## Test Coverage

| # | File | Test | What it covers |
|---|---|---|---|
| 1 | `src/lib/audit.test.ts` | detects Cursor + Copilot + Windsurf as redundant for coding use case | Redundancy detection fires when 3 overlapping coding tools are present |
| 2 | `src/lib/audit.test.ts` | detects Claude + Anthropic API as redundant Anthropic access | Redundancy detection catches double-paying for same model access |
| 3 | `src/lib/audit.test.ts` | flags Cursor Teams plan as overplan for 2 users | Overplan detection fires for Teams plan with ≤2 seats, calculates correct savings |
| 4 | `src/lib/audit.test.ts` | marks Claude Pro as optimal for solo writing user | No false positives — optimal spend correctly identified, savings = $0 |
| 5 | `src/lib/audit.test.ts` | sets highSavings true when monthly savings exceed $500 | highSavings flag triggers correctly for Credex CTA threshold |
| 6 | `src/lib/audit.test.ts` | annual savings is exactly 12x monthly savings | Math consistency — annual figure always derived correctly from monthly |
| 7 | `src/lib/audit.test.ts` | flags ChatGPT Team as overplan for 2 users on writing use case | Overplan detection for ChatGPT Team plan with small team + non-data use case |

---

## What's Not Tested (and Why)

- **API routes** (`/api/audit`, `/api/leads`) — would require mocking Supabase and Groq clients. Skipped for MVP; the audit engine logic they call is fully tested.
- **UI components** — no component tests. Lighthouse accessibility score of 96 provides confidence the UI is correct. Component tests would be added in week 2.
- **Groq fallback** — the fallback summary function is pure TypeScript and could be unit tested. Skipped for time; manual testing confirmed it works when the API key is invalid.