/**
 * Fails (exit 1) if the database doesn't hold what data/oregon-2026/inventory.json and verified/**
 * say it should: same races, candidates and measures, and every verified item, argument and
 * endorsement with the same text and source. Runs before every production build (scripts/predeploy.ts),
 * including deploys that skip the imports, so the site never goes live on data that doesn't match.
 *
 * Usage: DATABASE_URL=... npm run seed:check
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { databaseUrlUnpooled } from "../lib/env";
import * as schema from "../lib/db/schema";
import { checkInventory, checkVerified } from "../lib/seed/check";
import { loadInventory, loadVerified } from "../lib/seed/load";

const url = databaseUrlUnpooled();
if (!url) {
  console.error("No database URL is set (DATABASE_URL or STORAGE1_DATABASE_URL)");
  process.exit(1);
}

const [{ inv }, { plan }] = await Promise.all([
  loadInventory("data/oregon-2026/inventory.json"),
  loadVerified("data/oregon-2026/verified"),
]);
const pool = new Pool({ connectionString: url, max: 1 });
try {
  const db = drizzle(pool, { schema });
  const problems = [...(await checkInventory(db, inv)), ...(await checkVerified(db, plan))];
  if (problems.length) {
    console.error(`import check: the database doesn't match the data files:\n${problems.join("\n")}`);
    process.exitCode = 1;
  } else {
    console.log(
      `import check: database matches the data files (${inv.races.length} races, ${inv.candidates.length} candidates, ` +
        `${plan.items.length} items, ${plan.arguments.length} arguments, ${plan.endorsements.length} endorsements)`,
    );
  }
} finally {
  await pool.end();
}
