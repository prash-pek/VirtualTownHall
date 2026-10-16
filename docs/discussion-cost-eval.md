# Per-item discussion: cost estimate and model eval

Date: 2026-10-16. Code: `scripts/discuss-eval/` on branch `claude/project-thread-krzfj2`.

## Bottom line

- **Today (Opus 5.5, low effort) a typical Portland voter costs about $0.30 to $0.50** in Claude usage for the whole ballot (about 20 questions over 8 of 13 items). A King City voter costs about $0.20 to $0.27.
- **At scale (typical voter, Portland ballot): about $480 per 1k voters, $4.1k per 10k, $34k per 100k.** Heavy users (every item, 4 questions each) roughly triple that.
- **Output tokens are about 75% of the bill**, because every question is answered once per candidate. Portland Council District 3 has 21 candidates, so one question there costs about 6x a two-candidate race and the council race alone is roughly a third of a Portland voter's cost.
- The model choice is the biggest dial: Sonnet 5.5 is half the price of Opus 5.5, Haiku 5.5 is about 1/40th. Whether either holds quality on grounding is what the eval measures. **It is built and ready but needs an Anthropic Console API key to run (about $19 for the full run on the Batch API).**

## Recommended setup (quality first)

1. **Keep Opus 5.5 at low effort as the live model until the eval says otherwise.** Switch to Sonnet 5.5 only if it matches Opus on grounding (within about 1 point on "fully grounded" and "unsupported claim"), with zero neutrality failures. Don't use Haiku 5.5 for voter answers unless it clears the same bar; its price makes it tempting, but grounding errors are the costliest failure for this product.
2. **Precompute the starter questions.** Every race and measure page shows three fixed starter questions. Generate those answers once per item with Opus 5.5 at medium or high effort on the Batch API (about $10 to $20 for all 222 items), store them, and regenerate when an item's sources are republished. Starters are likely 30 to 40% of all questions, so this cuts live spend by about that much, makes the first answer instant, and lets an admin review those answers before voters see them. This raises quality rather than lowering it.
3. **Big races: let the voter compare a subset.** For races with many candidates (Council D3: 21), answering every candidate on every question is the main cost and also a wall of text. Defaulting to the candidates the voter picks (or all, on request) would cut that race's cost proportionally. This is a product call for Prash.
4. **Small fixes in the existing code** (Foundation owns these files):
   - `lib/discuss/run.ts` cost log assumes cache reads at 0.1x for every model; Opus 5.5 reads bill at 0.05x ($0.20/M), so logged costs run slightly high.
   - Follow-up history is resent uncached; a second cache breakpoint on the last history turn would make follow-ups cheaper on large races.
   - Bug: `app/api/discuss/route.ts` caps each history round at 12 responses, so a follow-up question on a race with more than 12 candidates (Council D3 has 21) is rejected as invalid.
5. **Spend guard:** the existing limit (60 questions per hour per IP) caps abuse at roughly $3.50 per IP per hour on the worst race. Add a daily spend alert on the Console key.

## How the numbers were built

- Prompt sizes are real: the eval builds each item's SOURCES block from the verified data in PR #14 plus the outlet endorsement slates, with the production prompt code (`lib/discuss/pack.ts`). Tokens are estimated at 3.5 characters per token; the scripts switch to exact counts when a key is set.
- Prices (Claude API, standard tier): Opus 5.5 $4 in / $20 out per million tokens (cache read $0.20), Sonnet 5.5 $2 / $10 (cache read $0.20), Haiku 5.5 $0.10 / $0.50. Cache writes cost 1.25x input.
- Assumed output: about 125 tokens per side plus 250 tokens of thinking and JSON per call at low effort (about 700 at medium). **This is the biggest unknown and the eval measures it**; `cost-model.ts` refits per-side and fixed output from the eval's measured usage.
- Profiles: light = 40% of items x 1.5 questions, typical = 60% x 2.5, heavy = every item x 4. Follow-ups replay the last 3 rounds.
- Caching: an item's prompt is identical for every voter, so popular items stay cached across voters. Scale columns assume 10% of first questions hit a warm cache at 1k voters, 50% at 10k, 90% at 100k.

| Ballot | Items | Prompt tokens (sum over items) | Largest item |
|---|---|---|---|
| Portland Council D3 address | 13 | about 64k | Council D3, 21 candidates, about 22k tokens |
| King City | 8 | about 31k | Washington County commissioner at-large, about 7k |

### Per voter, Portland D3 ballot (typical: about 20 questions)

| Model | Per voter | 1k voters | 10k voters | 100k voters |
|---|---|---|---|---|
| Opus 5.5, low effort (today) | $0.32 to $0.50 | $484 | $4.1k | $34k |
| Opus 5.5, medium effort | $0.51 to $0.69 | $675 | $6.0k | $53k |
| Sonnet 5.5, low effort | $0.17 to $0.26 | $248 | $2.1k | $18k |
| Sonnet 5.5, medium effort | $0.26 to $0.35 | $344 | $3.1k | $27k |
| Haiku 5.5, low effort | about $0.01 | $12 | $106 | $890 |

Light and heavy profiles and the King City ballot: run `npx tsx scripts/discuss-eval/cost-model.ts`.

## The eval

`scripts/discuss-eval/eval.ts` asks 6 questions on each of the 19 distinct items across both test ballots: 4 realistic voter questions, 1 the sources likely can't answer (does it say so instead of guessing?), and 1 asking for a recommendation or trying to override the rules (does it stay neutral?). It runs each through 6 configurations (Opus 5.5, Sonnet 5.5 and Haiku 5.5, each at low and medium effort), sent exactly as production sends them, then has Opus 5.5 at high effort grade every side against the same SOURCES: fully grounded, unsupported claims, citations that support the claim, wrongly declined, neutrality, even-handedness, and helpfulness (1 to 5). It prints a dry-run cost first and only spends with `--yes`.

To run (needs `TOWNHALL_ANTHROPIC_API_KEY` (or `ANTHROPIC_API_KEY`) from console.anthropic.com; a Claude Pro plan can't fund API calls):

```
npx tsx scripts/discuss-eval/eval.ts --data data/oregon-2026 --yes
npx tsx scripts/discuss-eval/cost-model.ts data/oregon-2026 "" scripts/discuss-eval/results/<run>/records.json
```
