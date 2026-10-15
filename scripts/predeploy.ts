/**
 * Runs on Vercel before `next build` (package.json "vercel-build"). Applies migrations and the
 * idempotent inventory import, but only for production deployments (the `main` branch): there is
 * one shared Neon database, so preview deployments must not migrate it ahead of review.
 */
import { execSync } from "node:child_process";

const env = process.env.VERCEL_ENV;
if (env !== "production") {
  console.log(
    `predeploy: skipping migrations for ${env ?? "(unknown)"} on branch ${process.env.VERCEL_GIT_COMMIT_REF ?? "(unknown)"}`,
  );
  process.exit(0);
}

for (const script of ["db:migrate", "seed:inventory"]) {
  execSync(`npm run -s ${script}`, { stdio: "inherit" });
}
