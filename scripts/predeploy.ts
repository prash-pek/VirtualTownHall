/**
 * Runs on Vercel before `next build` (package.json "vercel-build"). Applies migrations and the
 * idempotent inventory import, but only for the v2 branch: there is one shared Neon database,
 * so feature-branch previews must not migrate it ahead of review.
 */
import { execSync } from "node:child_process";

const branch = process.env.VERCEL_GIT_COMMIT_REF;
if (branch !== "v2") {
  console.log(`predeploy: skipping migrations on branch ${branch ?? "(unknown)"}`);
  process.exit(0);
}

for (const script of ["db:migrate", "seed:inventory"]) {
  execSync(`npm run -s ${script}`, { stdio: "inherit" });
}
