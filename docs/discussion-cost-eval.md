# Per-item discussion: cost and model eval

Date: 2026-10-16. Code: `scripts/discuss-eval/`. The eval ran on the real Portland Council District 3 and King City test ballots (19 items, PR #14 data) and cost about $9.60 in total.

## Bottom line

- **Recommendation: move live discussions from Opus 5.5 to Sonnet 5.5 at low effort, after the side-matching bug below is fixed.** In the eval, Sonnet matched Opus on every quality measure (grounding, neutrality, even-handedness, helpfulness) at half the price.
- **Per voter, typical Portland ballot (about 18 questions):** Sonnet 5.5 costs $0.11 to $0.16, and Opus 5.5 (today) costs $0.22 to $0.33. On the King City ballot it's $0.05 to $0.07 on Sonnet, $0.10 to $0.15 on Opus.
- **At scale, typical Portland voter:** Sonnet costs about $160 per 1k voters, $1.4k per 10k and $11.6k per 100k. Opus costs about $320, $2.7k and $23k.
- **Haiku 5.5 is about 1/40th the cost** ($630 per 100k voters) and was close behind on quality. It had more answers with an unsupported claim (4.7% vs 2.0%) and slightly lower helpfulness. Since grounding is the product's core promise, it isn't the live default.
- **Live bug found:** voters can see "No answer was produced for this side. Please ask again." The model often names a side by its label ("The case for YES", "Jeff Merkley, Democrat, incumbent") instead of its internal id, and `normalizeAnswers` in `lib/discuss/pack.ts` only accepts ids. Every measure side was dropped for all three models. On candidates, the drop rate was Opus 6%, Haiku 29% and Sonnet 95%. Sent to Foundation with a fix: put the side ids in the output schema as an enum, and match labels and order as a backstop. **Sonnet can't go live until this is fixed.**

## Eval results

Each model answered 95 questions: 5 per item, made up of 3 realistic voter questions, 1 the sources likely can't answer and 1 asking for a recommendation or trying to override the rules. All ran at low effort, sent exactly as production sends them. Opus 5.5 at high effort graded every side against the same SOURCES. Scores below credit each answer's real text even where production would have dropped it.

| Model (low effort) | Fully grounded | Has an unsupported claim | Wrongly declined | Gap questions declined | Neutral | Even-handed | Helpful (1 to 5) | $/question cold | $/question warm | Sides dropped by the bug |
|---|---|---|---|---|---|---|---|---|---|---|
| Opus 5.5 (today) | 96.3% | 3.7% | 0% | 96.8% | 100% | 98.9% | 4.38 | $0.045 | $0.011 | 6.3% |
| Sonnet 5.5 | 98.0% | 2.0% | 0% | 96.8% | 100% | 97.9% | 4.37 | $0.022 | $0.006 | 95.2% |
| Haiku 5.5 | 95.3% | 4.7% | 0% | 98.4% | 100% | 96.8% | 4.17 | $0.001 | $0.0003 | 28.9% |

- Each model produced about 300 graded sides. A gap of 1 to 2 points is within noise, so Opus and Sonnet are effectively tied, with Haiku a little behind.
- No model recommended a vote, even on the trap questions.
- "Cold" means the item's sources are written to cache on that call, and "warm" means they're read from it. Popular items stay warm across voters.

## Recommended setup (quality first)

1. **Fix side matching (Foundation), then switch the live model to Sonnet 5.5 at low effort.** That halves discussion cost with no measured quality loss. Re-run this eval after the fix to confirm no sides are dropped, which costs about $8.
2. **Precompute the starter questions.** Every race and measure page shows three fixed starter questions. Generate those answers once per item with Opus 5.5 at medium or high effort on the Batch API, about $10 to $20 for all 222 items. Store them, and regenerate when an item's sources are republished. Starters are likely 30 to 40% of all questions, so this cuts live spend by about that much. It also makes the first answer instant and lets an admin review those answers before voters see them.
3. **Big races: consider letting the voter compare a subset.** Output tokens are about 75% of the bill because every question is answered once per candidate. Portland Council District 3 has 21 candidates, so one question there costs about 6x a two-candidate race. Defaulting to the candidates a voter picks (or all, on request) cuts that race proportionally. This is a product call.
4. **Spend guard:** add a daily spend alert on the Console key. The existing limit of 60 questions per hour per IP caps abuse at roughly $2 per IP per hour on the worst race with Sonnet.

## Cost per voter and at scale

The output tokens per side (answer plus thinking) are measured from the eval. Medium-effort rows use an assumed 135 tokens per side plus 700 per call, because medium wasn't run.

Portland Council District 3 address (12 items with content, 43 sides), typical voter (60% of items, 2.5 questions each):

| Model | Per voter | 1k voters | 10k voters | 100k voters |
|---|---|---|---|---|
| Opus 5.5, low effort (today) | $0.22 to $0.33 | $317 | $2.7k | $23k |
| Opus 5.5, medium effort | $0.47 to $0.58 | $567 | $5.2k | $48k |
| **Sonnet 5.5, low effort (recommended)** | $0.11 to $0.16 | $158 | $1.4k | $11.6k |
| Sonnet 5.5, medium effort | $0.24 to $0.29 | $288 | $2.7k | $25k |
| Haiku 5.5, low effort | about $0.01 | $8 | $74 | $632 |

- Heavy users (every item, 4 questions each) cost about 2.5x the typical voter. King City voters cost about half as much as Portland voters.
- To see every profile, run `npx tsx scripts/discuss-eval/cost-model.ts data/oregon-2026 "" <records.json>`.

How the numbers were built:

- **Prompt sizes:** real. Each item's SOURCES block is built from the verified data with the production prompt code (`lib/discuss/pack.ts`).
- **Prices (standard tier, per million tokens):**
  - Opus 5.5: $4 in, $20 out, cache read $0.20.
  - Sonnet 5.5: $2 in, $10 out, cache read $0.20.
  - Haiku 5.5: $0.10 in, $0.50 out.
  - Cache writes cost 1.25x input.
- **Profiles:**
  - Light: 40% of items, 1.5 questions each.
  - Typical: 60% of items, 2.5 questions each.
  - Heavy: every item, 4 questions each.
  - Follow-ups replay the last 3 rounds, with history cached.
- **Caching:** the scale columns assume 10% of first questions hit a warm cache at 1k voters, 50% at 10k and 90% at 100k. The per-voter range runs from all-warm to all-cold.

## Re-running the eval

The eval needs `TOWNHALL_ANTHROPIC_API_KEY`. It ran once through a temporary preview-only route so the key never left Vercel, and that route has been removed. To run it again where a key is available:

```
npx tsx scripts/discuss-eval/eval.ts --data data/oregon-2026 --configs opus-5-5@low,sonnet-5-5@low,haiku-5-5@low --questions 3          # dry run, prints cost
npx tsx scripts/discuss-eval/eval.ts --data data/oregon-2026 --configs opus-5-5@low,sonnet-5-5@low,haiku-5-5@low --questions 3 --yes
```
