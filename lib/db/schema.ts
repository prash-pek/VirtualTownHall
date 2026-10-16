/**
 * TownHall AI v2 database schema (TRD v2 §3).
 *
 * Conventions:
 * - Every id is a UUIDv7 generated in the app.
 * - Every table has created_at / updated_at.
 * - `status` columns gate voter visibility: voter queries only ever read `published`.
 * - Slugs match the ids used in data/oregon-2026 so seed imports are idempotent.
 */
import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  customType,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

// ---------------------------------------------------------------------------
// Shared column helpers
// ---------------------------------------------------------------------------

const id = () =>
  uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7());

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/** PostGIS MultiPolygon in WGS84. Read/written as EWKB hex; spatial work happens in SQL. */
const multiPolygon = customType<{ data: string; driverData: string }>({
  dataType() {
    return "geometry(MultiPolygon, 4326)";
  },
});

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const jurisdictionType = pgEnum("jurisdiction_type", [
  "state",
  "county",
  "city",
  "metro",
  "congressional_district",
  "state_senate_district",
  "state_house_district",
  "school_district",
  "special_district",
  "other",
]);

/** Publication state for anything a voter can see. */
export const contentStatus = pgEnum("content_status", ["draft", "in_review", "published", "rejected"]);
export const candidateStatus = pgEnum("candidate_status", ["draft", "in_review", "published", "withdrawn"]);
export const profileSource = pgEnum("profile_source", ["public_seed", "candidate"]);
export const candidateItemKind = pgEnum("candidate_item_kind", [
  "bio",
  "position",
  "voting_record",
  "upload_chunk",
  "manual",
]);
export const measureSide = pgEnum("measure_side", ["yes", "no"]);
export const measureArgumentKind = pgEnum("measure_argument_kind", ["argument", "rebuttal", "explainer"]);
export const sourceTier = pgEnum("source_tier", ["T1", "T2", "T3"]);
export const verificationStatus = pgEnum("verification_status", ["verified", "corrected", "rejected"]);
export const verifierKind = pgEnum("verifier_kind", ["agent", "admin"]);
export const claimStatus = pgEnum("claim_status", ["pending", "approved", "rejected"]);
export const extractionStatus = pgEnum("extraction_status", ["pending", "processing", "done", "failed"]);
export const alignmentBasis = pgEnum("alignment_basis", ["public_seed_identity", "computed"]);
export const alignmentStatus = pgEnum("alignment_status", ["ok", "pending", "failed"]);
export const mappingSubjectType = pgEnum("mapping_subject_type", ["candidate", "measure_yes", "measure_no"]);
export const conversationSubjectType = pgEnum("conversation_subject_type", ["candidate", "measure"]);
export const messageRole = pgEnum("message_role", ["user", "assistant"]);
export const userRole = pgEnum("user_role", ["voter", "candidate", "admin"]);

// ---------------------------------------------------------------------------
// 3.1 Geography & ballot
// ---------------------------------------------------------------------------

export const elections = pgTable("elections", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  date: date("date").notNull(),
  state: text("state").notNull(),
  ...timestamps,
});

export const jurisdictions = pgTable(
  "jurisdictions",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    type: jurisdictionType("type").notNull(),
    parentId: uuid("parent_id").references((): AnyPgColumn => jurisdictions.id),
    boundary: multiPolygon("boundary"),
    censusGeoid: text("census_geoid"),
    ...timestamps,
  },
  (t) => [
    index("jurisdictions_parent_idx").on(t.parentId),
    index("jurisdictions_boundary_gist").using("gist", t.boundary),
  ],
);

export const races = pgTable(
  "races",
  {
    id: id(),
    electionId: uuid("election_id")
      .notNull()
      .references(() => elections.id),
    jurisdictionId: uuid("jurisdiction_id")
      .notNull()
      .references(() => jurisdictions.id),
    slug: text("slug").notNull().unique(),
    office: text("office").notNull(),
    districtLabel: text("district_label"),
    /** Null when the filing source doesn't state the number of seats. */
    seats: smallint("seats"),
    partisan: boolean("partisan").notNull(),
    rankedChoice: boolean("ranked_choice").notNull().default(false),
    ballotOrder: integer("ballot_order").notNull(),
    ...timestamps,
  },
  (t) => [index("races_election_jurisdiction_idx").on(t.electionId, t.jurisdictionId)],
);

export const ballotMeasures = pgTable(
  "ballot_measures",
  {
    id: id(),
    electionId: uuid("election_id")
      .notNull()
      .references(() => elections.id),
    jurisdictionId: uuid("jurisdiction_id")
      .notNull()
      .references(() => jurisdictions.id),
    slug: text("slug").notNull().unique(),
    number: text("number").notNull(),
    title: text("title").notNull(),
    ballotLabel: text("ballot_label"),
    summary: text("summary"),
    yesMeans: text("yes_means"),
    noMeans: text("no_means"),
    fiscalImpact: text("fiscal_impact"),
    fullTextUrl: text("full_text_url"),
    /** What collection couldn't find (e.g. "No filed argument in opposition"), shown to voters as-is. */
    gaps: text("gaps")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    ballotOrder: integer("ballot_order").notNull(),
    status: contentStatus("status").notNull().default("draft"),
    ...timestamps,
  },
  (t) => [
    index("ballot_measures_election_jurisdiction_idx").on(t.electionId, t.jurisdictionId),
    index("ballot_measures_status_idx").on(t.status),
  ],
);

// ---------------------------------------------------------------------------
// 3.3 Sources & verification (declared before items that reference sources)
// ---------------------------------------------------------------------------

export const sources = pgTable("sources", {
  id: id(),
  url: text("url").notNull(),
  canonicalUrl: text("canonical_url").notNull().unique(),
  publisher: text("publisher"),
  tier: sourceTier("tier").notNull(),
  publishedAt: date("published_at"),
  retrievedAt: timestamp("retrieved_at", { withTimezone: true }),
  contentSha256: text("content_sha256"),
  archivedBlobKey: text("archived_blob_key"),
  redFlags: jsonb("red_flags").$type<string[]>().notNull().default([]),
  ...timestamps,
});

/** Append-only verification history; subject is any verifiable row (item, argument, measure field). */
export const verifications = pgTable(
  "verifications",
  {
    id: id(),
    subjectType: text("subject_type").notNull(),
    subjectId: uuid("subject_id").notNull(),
    status: verificationStatus("status").notNull(),
    checksFailed: text("checks_failed")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    note: text("note"),
    verifier: verifierKind("verifier").notNull(),
    model: text("model"),
    ...timestamps,
  },
  (t) => [index("verifications_subject_idx").on(t.subjectType, t.subjectId, t.createdAt)],
);

export const ingestionRuns = pgTable("ingestion_runs", {
  id: id(),
  scope: text("scope").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  stats: jsonb("stats").$type<Record<string, number>>().notNull().default({}),
  reportMd: text("report_md"),
  ...timestamps,
});

export const measureArguments = pgTable(
  "measure_arguments",
  {
    id: id(),
    measureId: uuid("measure_id")
      .notNull()
      .references(() => ballotMeasures.id, { onDelete: "cascade" }),
    side: measureSide("side").notNull(),
    kind: measureArgumentKind("kind").notNull(),
    author: text("author"),
    topic: text("topic"),
    statement: text("statement").notNull(),
    excerpt: text("excerpt"),
    sourceId: uuid("source_id").references(() => sources.id),
    contentHash: text("content_hash").notNull(),
    status: contentStatus("status").notNull().default("draft"),
    ...timestamps,
  },
  (t) => [
    index("measure_arguments_measure_idx").on(t.measureId, t.side),
    uniqueIndex("measure_arguments_measure_hash_uq").on(t.measureId, t.contentHash),
  ],
);

// ---------------------------------------------------------------------------
// 3.2 Candidates
// ---------------------------------------------------------------------------

export type PersonaConfig = {
  tone?: string;
  greeting?: string;
  [key: string]: unknown;
};

export const candidates = pgTable(
  "candidates",
  {
    id: id(),
    raceId: uuid("race_id")
      .notNull()
      .references(() => races.id),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    party: text("party"),
    incumbent: boolean("incumbent"),
    occupation: text("occupation"),
    websiteUrl: text("website_url"),
    profileSource: profileSource("profile_source").notNull().default("public_seed"),
    ownerUserId: text("owner_user_id"),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
    isVerified: boolean("is_verified").notNull().default(false),
    isPaused: boolean("is_paused").notNull().default(false),
    donationUrl: text("donation_url"),
    personaConfig: jsonb("persona_config").$type<PersonaConfig>().notNull().default({}),
    ballotOrder: integer("ballot_order").notNull().default(0),
    gaps: text("gaps")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    status: candidateStatus("status").notNull().default("draft"),
    ...timestamps,
  },
  (t) => [
    index("candidates_race_idx").on(t.raceId, t.ballotOrder),
    index("candidates_owner_idx").on(t.ownerUserId),
    index("candidates_status_idx").on(t.status),
  ],
);

export const uploads = pgTable("uploads", {
  id: id(),
  candidateId: uuid("candidate_id")
    .notNull()
    .references(() => candidates.id, { onDelete: "cascade" }),
  blobKey: text("blob_key").notNull(),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  sha256: text("sha256").notNull(),
  extractedTextStatus: extractionStatus("extracted_text_status").notNull().default("pending"),
  ...timestamps,
});

export const candidateItems = pgTable(
  "candidate_items",
  {
    id: id(),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    kind: candidateItemKind("kind").notNull(),
    topic: text("topic"),
    statement: text("statement").notNull(),
    excerpt: text("excerpt"),
    sourceId: uuid("source_id").references(() => sources.id),
    uploadId: uuid("upload_id").references(() => uploads.id, { onDelete: "set null" }),
    isActive: boolean("is_active").notNull().default(true),
    contentHash: text("content_hash").notNull(),
    status: contentStatus("status").notNull().default("draft"),
    ...timestamps,
  },
  (t) => [
    index("candidate_items_candidate_idx").on(t.candidateId, t.status),
    uniqueIndex("candidate_items_candidate_hash_uq").on(t.candidateId, t.contentHash),
    index("candidate_items_fts_idx").using(
      "gin",
      sql`to_tsvector('english', coalesce(${t.topic}, '') || ' ' || ${t.statement} || ' ' || coalesce(${t.excerpt}, ''))`,
    ),
  ],
);

/**
 * Who endorsed a candidate or a measure side ("Endorsed by"). Shown to voters as a public record of
 * what the endorser said, never scored into Alignment. Published together with its candidate or measure.
 */
export const endorsements = pgTable(
  "endorsements",
  {
    id: id(),
    candidateId: uuid("candidate_id").references(() => candidates.id, { onDelete: "cascade" }),
    measureId: uuid("measure_id").references(() => ballotMeasures.id, { onDelete: "cascade" }),
    side: measureSide("side"),
    endorser: text("endorser").notNull(),
    /** outlet | organization | official | party | other, as collected. */
    endorserType: text("endorser_type").notNull(),
    rank: integer("rank"),
    statement: text("statement").notNull(),
    excerpt: text("excerpt"),
    sourceId: uuid("source_id").references(() => sources.id),
    endorsedOn: date("endorsed_on"),
    contentHash: text("content_hash").notNull(),
    status: contentStatus("status").notNull().default("draft"),
    ...timestamps,
  },
  (t) => [
    index("endorsements_candidate_idx").on(t.candidateId),
    index("endorsements_measure_idx").on(t.measureId, t.side),
    uniqueIndex("endorsements_hash_uq").on(t.contentHash),
    check(
      "endorsements_one_subject",
      sql`(${t.candidateId} IS NOT NULL AND ${t.measureId} IS NULL AND ${t.side} IS NULL) OR (${t.candidateId} IS NULL AND ${t.measureId} IS NOT NULL AND ${t.side} IS NOT NULL)`,
    ),
  ],
);

export const blockedTopics = pgTable(
  "blocked_topics",
  {
    id: id(),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    topic: text("topic").notNull(),
    redirectMessage: text("redirect_message").notNull(),
    redirectUrl: text("redirect_url"),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [index("blocked_topics_candidate_idx").on(t.candidateId)],
);

export const claims = pgTable(
  "claims",
  {
    id: id(),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidates.id),
    userId: text("user_id").notNull(),
    evidence: jsonb("evidence").$type<Record<string, unknown>>().notNull().default({}),
    status: claimStatus("status").notNull().default("pending"),
    reviewedBy: text("reviewed_by"),
    ...timestamps,
  },
  (t) => [index("claims_candidate_idx").on(t.candidateId), index("claims_status_idx").on(t.status)],
);

// ---------------------------------------------------------------------------
// 3.4 Scores & values
// ---------------------------------------------------------------------------

export type Discrepancy = { topic: string; detail: string; source_ids?: string[] };

/** Latest row per candidate is current. */
export const alignmentScores = pgTable(
  "alignment_scores",
  {
    id: id(),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    score: smallint("score"),
    basis: alignmentBasis("basis").notNull(),
    status: alignmentStatus("status").notNull(),
    discrepancies: jsonb("discrepancies").$type<Discrepancy[]>().notNull().default([]),
    rationale: text("rationale"),
    model: text("model"),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
    ...timestamps,
  },
  (t) => [
    index("alignment_scores_candidate_idx").on(t.candidateId, t.computedAt),
    check("alignment_scores_score_range", sql`${t.score} IS NULL OR (${t.score} BETWEEN 0 AND 100)`),
    check("alignment_scores_ok_has_score", sql`${t.status} <> 'ok' OR ${t.score} IS NOT NULL`),
  ],
);

export const valuesStatements = pgTable("values_statements", {
  id: id(),
  topic: text("topic").notNull(),
  text: text("text").notNull(),
  displayOrder: integer("display_order").notNull(),
  ...timestamps,
});

export const positionMappings = pgTable(
  "position_mappings",
  {
    id: id(),
    subjectType: mappingSubjectType("subject_type").notNull(),
    subjectId: uuid("subject_id").notNull(),
    statementId: uuid("statement_id")
      .notNull()
      .references(() => valuesStatements.id),
    stance: smallint("stance").notNull(),
    rationale: text("rationale").notNull(),
    sourceId: uuid("source_id").references(() => sources.id),
    status: contentStatus("status").notNull().default("draft"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("position_mappings_subject_statement_uq").on(t.subjectType, t.subjectId, t.statementId),
    check("position_mappings_stance_range", sql`${t.stance} BETWEEN -2 AND 2`),
  ],
);

export const voterValues = pgTable(
  "voter_values",
  {
    userId: text("user_id").notNull(),
    statementId: uuid("statement_id")
      .notNull()
      .references(() => valuesStatements.id),
    answer: smallint("answer").notNull(),
    weight: smallint("weight").notNull(),
    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.statementId] }),
    check("voter_values_answer_range", sql`${t.answer} BETWEEN -2 AND 2`),
    check("voter_values_weight_range", sql`${t.weight} BETWEEN 0 AND 3`),
  ],
);

// ---------------------------------------------------------------------------
// 3.5 Users, conversations, analytics, audit
// ---------------------------------------------------------------------------

/** Mirrors what the app needs from Clerk. Raw addresses are never stored. */
export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  role: userRole("role").notNull().default("voter"),
  zip: text("zip"),
  addressHash: text("address_hash"),
  jurisdictionIds: uuid("jurisdiction_ids").array(),
  interestTags: text("interest_tags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  /** The voter's own "My ballot": item keys such as "race:or-us-senate" (see lib/ballot/types.ts). */
  ballotItems: text("ballot_items")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  ...timestamps,
});

export const conversations = pgTable(
  "conversations",
  {
    id: id(),
    subjectType: conversationSubjectType("subject_type").notNull(),
    subjectId: uuid("subject_id").notNull(),
    ownerUserId: text("owner_user_id"),
    anonSessionId: text("anon_session_id"),
    summary: text("summary"),
    topicTags: text("topic_tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    messageCount: integer("message_count").notNull().default(0),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    check("conversations_exactly_one_owner", sql`(${t.ownerUserId} IS NOT NULL) <> (${t.anonSessionId} IS NOT NULL)`),
    index("conversations_owner_idx").on(t.ownerUserId),
    index("conversations_anon_idx").on(t.anonSessionId),
    index("conversations_subject_idx").on(t.subjectType, t.subjectId),
  ],
);

export type Citation = { source_id: string; cited_text?: string; document_index?: number };

export const messages = pgTable(
  "messages",
  {
    id: id(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: messageRole("role").notNull(),
    content: text("content").notNull(),
    citations: jsonb("citations").$type<Citation[]>().notNull().default([]),
    blockedTopicId: uuid("blocked_topic_id").references(() => blockedTopics.id, { onDelete: "set null" }),
    model: text("model"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    ...timestamps,
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId, t.createdAt)],
);

export const aiCalls = pgTable(
  "ai_calls",
  {
    id: id(),
    route: text("route").notNull(),
    model: text("model").notNull(),
    effort: text("effort"),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    cacheReadTokens: integer("cache_read_tokens").notNull().default(0),
    cacheWriteTokens: integer("cache_write_tokens").notNull().default(0),
    latencyMs: integer("latency_ms"),
    stopReason: text("stop_reason"),
    refusalCategory: text("refusal_category"),
    costUsd: numeric("cost_usd", { precision: 12, scale: 6 }).notNull().default("0"),
    ...timestamps,
  },
  (t) => [index("ai_calls_route_created_idx").on(t.route, t.createdAt)],
);

/**
 * Hash-chained audit log: hash = sha256(prev_hash ‖ canonical_json(entry)), seq monotonic per subject.
 * UPDATE and DELETE are blocked by a trigger (see drizzle/0002_audit_log_append_only.sql).
 */
export const auditLog = pgTable(
  "audit_log",
  {
    id: id(),
    subjectType: text("subject_type").notNull(),
    subjectId: uuid("subject_id").notNull(),
    seq: integer("seq").notNull(),
    action: text("action").notNull(),
    actorId: text("actor_id"),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    prevHash: text("prev_hash"),
    hash: text("hash").notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("audit_log_subject_seq_uq").on(t.subjectType, t.subjectId, t.seq),
    check("audit_log_seq_positive", sql`${t.seq} >= 1`),
  ],
);
