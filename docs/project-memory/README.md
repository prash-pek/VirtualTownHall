# Project memory backup

This folder is a snapshot of the Claude project memory for the "Townhall AI" project, so the history of decisions survives even if the project's memory store is lost.

- **Snapshot taken:** 2026-10-16 23:15 UTC
- **Live copy:** the Claude project memory remains the source of truth. This folder is a backup and can lag behind it.
- **Contents:** `MEMORY.md` is the index (short facts plus links); each other `.md` file is one memory linked from it or kept alongside it. Secrets are never stored in memory and none are in this folder (environment variable names only, no values).
- **Refreshing:** whenever a decision is added to project memory, copy the memory files here again and update the date above.

To restore after a loss, copy these files (except this README) back into the project memory folder.
