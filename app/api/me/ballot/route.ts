import { NextResponse } from "next/server";

import { sanitizeBallot } from "@/lib/ballot/types";
import { getDb } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** The signed-in voter's saved "My ballot". Signed-out voters keep theirs in the browser. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const [row] = await getDb()
    .select({ items: profiles.ballotItems })
    .from(profiles)
    .where(eq(profiles.userId, session.userId));
  return NextResponse.json({ items: row?.items ?? [] });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const json = (await request.json().catch(() => null)) as { items?: unknown } | null;
  const items = sanitizeBallot(json?.items);
  await getDb()
    .insert(profiles)
    .values({ userId: session.userId, role: session.role, ballotItems: items })
    .onConflictDoUpdate({ target: profiles.userId, set: { ballotItems: items, updatedAt: new Date() } });
  return NextResponse.json({ items });
}
