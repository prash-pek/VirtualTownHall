---
name: townhall-vercel
description: Vercel project, team and custom domain setup for TownHall AI v2
metadata:
  type: reference
  modified: 2026-10-14T06:19:19.518Z
---

- Team: prashanthpeketi-1912s-projects (team_jMRon2OmV6aOySlP6FFiuiFA).
- v2 project: **townhall-ai-v2** (prj_4dIFGWCPHH92L6MDYpqMIXtMk851), framework nextjs, linked to prash-pek/VirtualTownHall, functions in pdx1. Ignored build step builds only when root package.json declares "next" (skips v1 and data-only branches).
- Domain townhallai.outsetinno.com: since 2026-10-15 a Production domain (no gitBranch); app at the root (no base path). DNS is at Squarespace (external); CNAME `townhallai` → `644ca7df3829cf38.vercel-dns-017.com` added by Prash 2026-10-14; Vercel reports it valid and cert issued (cert_l1roKTp45dzUazOerJ5jCD8k, auto-renew).
- Project production branch is `main` (main = v2 app since PR #5).
- Old v1 project **townhall_ai** (prj_DJpgaxGgTru36UNYHkah8Vs8ZHtO) also serves apex outsetinno.com. Don't touch it beyond this: 2026-10-15, at Prash's request, its ignored build step was set to build only `main` (it was failing on v2 builds and emailing alerts).
- 2026-10-15: v2 branch deploy (PR #1 merge, 7326c85) took over townhallai.outsetinno.com automatically; placeholder deployment no longer aliased there.

Related: [[townhall-repo-and-specs]].
Progress file for a fresh session: /mnt/project-files/townhall/progress/foundation.md.
- 2026-10-15: Prash moved v2 to `main` (PR #5); v1 code archived on branch `v1`. Old v1 Vercel project townhall_ai DELETED by Prash. townhall-ai-v2 production branch = main; predeploy migrates only when VERCEL_ENV=production. PR #6 drops the /townhallai base path (app at domain root).
- outsetinno.com now served by Vercel project **outsetinno-landing** (prj_PnUfrdM9aja6lveCGf6LVm174LdU): static coming-soon page from orphan branch `outset-landing` of the VirtualTownHall repo, deployed via create_deployment gitSource (not auto-deploying). Source also at /mnt/project-files/outset-landing/. Prash: outsetinno.com is the umbrella landing page for all projects, not TownHall.
