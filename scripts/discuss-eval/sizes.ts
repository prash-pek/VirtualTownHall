/**
 * Prompt sizes for every item on the test ballots, with no API calls.
 *
 *   npx tsx scripts/discuss-eval/sizes.ts [data/oregon-2026] [outlets dir]
 *
 * Tokens are estimated at 3.5 characters per token (current Claude tokenizer, English prose with URLs)
 * unless ANTHROPIC_API_KEY is set, in which case the count_tokens endpoint gives exact numbers.
 */
import Anthropic from "@anthropic-ai/sdk";

import { buildPack, systemPrompt } from "@/lib/discuss/pack";

import { ballots, loadDataset, packFor } from "./packs";

const root = process.argv[2] ?? "data/oregon-2026";
const ds = await loadDataset(root, process.argv[3]);
const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

async function tokens(system: string, sources: string): Promise<number> {
  if (!client) return Math.round((system.length + sources.length + 20) / 3.5);
  const r = await client.messages.countTokens({
    model: "claude-opus-5-5",
    system: [
      { type: "text", text: system },
      { type: "text", text: `SOURCES:\n${sources}` },
    ],
    messages: [{ role: "user", content: "x" }],
  });
  return r.input_tokens;
}

const rows: Record<string, unknown>[] = [];
for (const [ballot, items] of Object.entries(ballots)) {
  let total = 0;
  for (const key of items) {
    const pack = packFor(ds, key);
    if (!pack) {
      console.log(`${ballot}\t${key}\t(no content)`);
      continue;
    }
    const { text, sources } = buildPack(pack);
    const t = await tokens(systemPrompt(pack.kind), text);
    total += t;
    rows.push({ ballot, key, sides: pack.sides.length, sources: sources.length, chars: text.length, promptTokens: t });
    console.log(`${ballot}\t${key}\tsides=${pack.sides.length}\tsources=${sources.length}\tprompt≈${t} tokens`);
  }
  console.log(`${ballot}\tTOTAL prompt tokens across items ≈ ${total}\n`);
}
console.log(JSON.stringify({ exact: !!client, rows }));
