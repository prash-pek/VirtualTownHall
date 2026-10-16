---
name: progress-docs-for-resets
description: Prash wants every thread to keep a progress file and push WIP often so work survives usage-credit resets
metadata:
  type: feedback
  modified: 2026-10-14T06:28:06.935Z
---

Every thread keeps /mnt/project-files/townhall/progress/<thread-slug>.md current: what's done, what's in flight, which records are verified vs pending, the exact next step, and open questions. Push WIP commits to the thread's branch often.

**Why:** Prash (2026-10-14): usage credits can run out mid-work, and sessions reset; background agents don't survive a reset.
**How to apply:** Write the progress file at thread start and update it on each milestone; commit collected/verified records as they land. See [[townhall-repo-and-specs]].
