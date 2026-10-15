import { ipAddress } from "@vercel/functions";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCatalog, getJurisdictionRefs } from "@/lib/ballot/catalog";
import { geocodeAddress } from "@/lib/ballot/census";
import { matchJurisdictions } from "@/lib/ballot/districts";
import { coveredStates, defaultState, isStateCode } from "@/lib/ballot/states";
import { checkLimit } from "@/lib/ratelimit";

const body = z.object({
  address: z.string().trim().min(5).max(200),
  state: z.string().refine(isStateCode).default(defaultState),
});

/**
 * Suggests races and measures for an address. The address is used for this lookup only and is not
 * stored. Suggestions are a starting point; the voter adds and removes items freely.
 */
export async function POST(request: Request) {
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_address" }, { status: 400 });

  const ip = ipAddress(request) ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await checkLimit("ballotLookupPerIp", ip);
  if (!success) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let districts;
  try {
    districts = await geocodeAddress(parsed.data.address, parsed.data.state);
  } catch {
    return NextResponse.json({ error: "geocoder_unavailable" }, { status: 502 });
  }
  if (!districts) return NextResponse.json({ error: "address_not_found" }, { status: 404 });

  // Any US address is accepted; we only have ballot data for some states so far.
  if (!coveredStates.includes(parsed.data.state)) {
    return NextResponse.json({ matchedAddress: districts.matchedAddress, covered: false, suggested: [], nearby: [] });
  }

  const [catalog, refs] = await Promise.all([getCatalog(), getJurisdictionRefs()]);
  const { matched, nearby } = matchJurisdictions(districts, refs);
  const inSet = (set: string[]) => (item: { jurisdictionSlug: string }) => set.includes(item.jurisdictionSlug);

  return NextResponse.json({
    matchedAddress: districts.matchedAddress,
    covered: true,
    suggested: [...catalog.races.filter(inSet(matched)), ...catalog.measures.filter(inSet(matched))].map((i) => i.key),
    nearby: [...catalog.races.filter(inSet(nearby)), ...catalog.measures.filter(inSet(nearby))].map((i) => i.key),
  });
}
