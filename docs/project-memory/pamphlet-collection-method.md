---
name: pamphlet-collection-method
description: How Oregon voters' pamphlet statements are collected (script vs WebFetch decision, 2026-10-15)
metadata:
  type: project
  modified: 2026-10-15T19:59:42.638Z
---

Decision (Prash, 2026-10-15): pamphlet statements are collected by curl-downloading the county PDF and running data/oregon-2026/pipeline/pamphlet_extract.py, then a Sonnet collector quotes from the extract folder. WebFetch is only for news/position searches.

**Why:** A/B test on the Washington County pamphlet (5 Tigard/Tualatin candidates): script arm got 5/5 full verbatim statements for ~68k tokens; WebFetch arm got 0/5 (PDF returned as binary) for ~56k tokens. Earlier WebFetch runs truncated long PDFs and capped quotes (~11-word median excerpts).

**How to apply:** Needs the cloud environment that allows the Oregon .gov hosts (www.washingtoncountyor.gov, www.clackamas.us, dochub.clackamas.us, multco.us). Results: /mnt/project-files/townhall/data/pamphlet-ab-test/. See [[oregon-inventory-gap-plan]].
