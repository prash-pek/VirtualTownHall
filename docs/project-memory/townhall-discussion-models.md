---
name: townhall-discussion-models
description: Measured cost and quality of discussion models (2026-10-16 eval) and the side-matching bug that blocks switching to Sonnet
metadata:
  type: project
  modified: 2026-10-16T21:42:45.098Z
---

Eval of the per-item discussion, run 2026-10-16 on the Portland D3 and King City test ballots. It cost about $9.60 and ran once through a temporary Vercel preview route, which has since been deleted. Report: /mnt/project-files/townhall/cost/discussion-cost-eval.md. Scripts and the PR: scripts/discuss-eval/, PR #17.

Results at low effort:

| Model | Fully grounded | Helpful (1 to 5) | Typical Portland voter | Per 100k voters |
|---|---|---|---|---|
| Opus 5.5 | 96.3% | 4.38 | $0.22 to $0.33 | $23k |
| Sonnet 5.5 | 98.0% | 4.37 | $0.11 to $0.16 | $11.6k |
| Haiku 5.5 | 95.3% | 4.17 | about $0.01 | $630 |

No model ever recommended a vote.

**Recommendation:** switch the live model to Sonnet 5.5 at low effort. Prash has not decided yet.

**Blocker:** normalizeAnswers in lib/discuss/pack.ts matches side ids only. Models often return the side's label instead, so voters see "No answer was produced". This hits every measure side, and 95% of Sonnet's sides. The bug went to Foundation, which owns lib/discuss. The fix is an enum of side ids in the output schema, plus matching on label and order as a backstop (see relabel in scripts/discuss-eval/core.ts).

**Why:** this is the main lever on discussion cost. Prash said not to skimp on quality, and on these results Sonnet doesn't.

**How to apply:** before changing the discussion model, confirm the side-matching fix has landed. Re-run the eval (about $8) to confirm no sides are dropped.
