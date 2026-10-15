import { createHash } from "node:crypto";

/** JSON with object keys sorted at every level, so the same entry always hashes the same. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export type AuditEntry = {
  subjectType: string;
  subjectId: string;
  seq: number;
  action: string;
  actorId: string | null;
  payload: Record<string, unknown>;
};

/** hash = sha256(prev_hash ‖ canonical_json(entry)); the first entry for a subject chains from "". */
export function auditHash(prevHash: string | null, entry: AuditEntry): string {
  return createHash("sha256")
    .update(prevHash ?? "")
    .update(canonicalJson(entry))
    .digest("hex");
}
