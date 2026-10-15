# Running the pipeline (cost rules)

Set 2026-10-15 after the first full runs used too much of the usage budget.

- **Models:** run collector and verifier agents on Sonnet (`model: "sonnet"`). The orchestrating session only
  splits batches, strips files, validates, runs `apply_fixes.py` and commits; it does not browse.
- **Concurrency:** at most 3 agents at a time. Batches of 10–25 candidates, one race group per agent.
- **Pamphlets:** when the session can reach the county/SOS sites directly, download each pamphlet once and
  run `pamphlet_extract.py` for the batch's candidate ids. Pass the extract folder to the collector, which reads
  step 1 from those files instead of paging the PDF through WebFetch. The citation is still the pamphlet URL.
- **Search set unchanged:** steps 1–6 in COLLECTOR.md stay as they are, including the three news-domain
  searches in step 5 (Prash, 2026-10-15: keep 3 for accuracy).
- **PR noise:** don't subscribe the orchestrating session to PR activity while it runs batches; check the PR
  when a batch is pushed.
- Record each agent's token usage from its completion notice in the batch's verification report, so cost per
  candidate can be tracked.

## Cost test, 2026-10-15

A Sonnet collector on Sherwood (4 candidates) used 17 calls. Per candidate: cache_write 20.7k, cache_read 268k, output 1.0k.
The Opus baselines per candidate:
- Portland collector: cache_write 13.0k, cache_read 314k, output 2.2k.
- Multnomah cities collector: cache_write 29.9k, cache_read 720k, output 3.1k.

Token volume is similar or lower. Most of the saving comes from Sonnet's lower per-token price.

Larger test on Sonnet (Senate 13, House 26, House 40; 9 candidates), per candidate:
- Collector: cache_write 13.2k, cache_read 229k, output 1.2k.
- Verifier: cache_write 5.7k, cache_read 127k, output 0.4k.

Opus verifier baselines per candidate:
- Clackamas County: cache_write 9.8k, cache_read 329k, output 2.7k.
- Portland D4: cache_write 14.3k, cache_read 224k, output 1.9k.

Quality: the collector wrongly logged the House 26 pamphlet as truncated. The statements are readable at a WebFetch offset of 60000. The verifier caught the miss.
