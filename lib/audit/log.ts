import "server-only";

import { and, desc, eq } from "drizzle-orm";

import type { Db } from "@/lib/db/client";
import { auditLog } from "@/lib/db/schema";

import { auditHash, type AuditEntry } from "./hash";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** Appends one entry to a subject's hash chain. Call inside the transaction that makes the change. */
export async function appendAudit(tx: Tx, entry: Omit<AuditEntry, "seq">) {
  const [last] = await tx
    .select({ seq: auditLog.seq, hash: auditLog.hash })
    .from(auditLog)
    .where(and(eq(auditLog.subjectType, entry.subjectType), eq(auditLog.subjectId, entry.subjectId)))
    .orderBy(desc(auditLog.seq))
    .limit(1);
  const full: AuditEntry = { ...entry, seq: (last?.seq ?? 0) + 1 };
  const prevHash = last?.hash ?? null;
  await tx.insert(auditLog).values({ ...full, prevHash, hash: auditHash(prevHash, full) });
}
