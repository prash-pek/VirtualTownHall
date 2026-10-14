CREATE TYPE "public"."alignment_basis" AS ENUM('public_seed_identity', 'computed');--> statement-breakpoint
CREATE TYPE "public"."alignment_status" AS ENUM('ok', 'pending', 'failed');--> statement-breakpoint
CREATE TYPE "public"."candidate_item_kind" AS ENUM('bio', 'position', 'voting_record', 'upload_chunk', 'manual');--> statement-breakpoint
CREATE TYPE "public"."candidate_status" AS ENUM('draft', 'in_review', 'published', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."claim_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'in_review', 'published', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."conversation_subject_type" AS ENUM('candidate', 'measure');--> statement-breakpoint
CREATE TYPE "public"."extraction_status" AS ENUM('pending', 'processing', 'done', 'failed');--> statement-breakpoint
CREATE TYPE "public"."jurisdiction_type" AS ENUM('state', 'county', 'city', 'metro', 'congressional_district', 'state_senate_district', 'state_house_district', 'school_district', 'special_district', 'other');--> statement-breakpoint
CREATE TYPE "public"."mapping_subject_type" AS ENUM('candidate', 'measure_yes', 'measure_no');--> statement-breakpoint
CREATE TYPE "public"."measure_argument_kind" AS ENUM('argument', 'rebuttal', 'explainer');--> statement-breakpoint
CREATE TYPE "public"."measure_side" AS ENUM('yes', 'no');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TYPE "public"."profile_source" AS ENUM('public_seed', 'candidate');--> statement-breakpoint
CREATE TYPE "public"."source_tier" AS ENUM('T1', 'T2', 'T3');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('voter', 'candidate', 'admin');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('verified', 'corrected', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."verifier_kind" AS ENUM('agent', 'admin');--> statement-breakpoint
CREATE TABLE "ai_calls" (
	"id" uuid PRIMARY KEY NOT NULL,
	"route" text NOT NULL,
	"model" text NOT NULL,
	"effort" text,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"cache_read_tokens" integer DEFAULT 0 NOT NULL,
	"cache_write_tokens" integer DEFAULT 0 NOT NULL,
	"latency_ms" integer,
	"stop_reason" text,
	"refusal_category" text,
	"cost_usd" numeric(12, 6) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alignment_scores" (
	"id" uuid PRIMARY KEY NOT NULL,
	"candidate_id" uuid NOT NULL,
	"score" smallint,
	"basis" "alignment_basis" NOT NULL,
	"status" "alignment_status" NOT NULL,
	"discrepancies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rationale" text,
	"model" text,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alignment_scores_score_range" CHECK ("alignment_scores"."score" IS NULL OR ("alignment_scores"."score" BETWEEN 0 AND 100)),
	CONSTRAINT "alignment_scores_ok_has_score" CHECK ("alignment_scores"."status" <> 'ok' OR "alignment_scores"."score" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY NOT NULL,
	"subject_type" text NOT NULL,
	"subject_id" uuid NOT NULL,
	"seq" integer NOT NULL,
	"action" text NOT NULL,
	"actor_id" text,
	"payload" jsonb NOT NULL,
	"prev_hash" text,
	"hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audit_log_seq_positive" CHECK ("audit_log"."seq" >= 1)
);
--> statement-breakpoint
CREATE TABLE "ballot_measures" (
	"id" uuid PRIMARY KEY NOT NULL,
	"election_id" uuid NOT NULL,
	"jurisdiction_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"number" text NOT NULL,
	"title" text NOT NULL,
	"ballot_label" text,
	"summary" text,
	"yes_means" text,
	"no_means" text,
	"fiscal_impact" text,
	"full_text_url" text,
	"ballot_order" integer NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ballot_measures_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blocked_topics" (
	"id" uuid PRIMARY KEY NOT NULL,
	"candidate_id" uuid NOT NULL,
	"topic" text NOT NULL,
	"redirect_message" text NOT NULL,
	"redirect_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"candidate_id" uuid NOT NULL,
	"kind" "candidate_item_kind" NOT NULL,
	"topic" text,
	"statement" text NOT NULL,
	"excerpt" text,
	"source_id" uuid,
	"upload_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"content_hash" text NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" uuid PRIMARY KEY NOT NULL,
	"race_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"party" text,
	"incumbent" boolean,
	"occupation" text,
	"website_url" text,
	"profile_source" "profile_source" DEFAULT 'public_seed' NOT NULL,
	"owner_user_id" text,
	"claimed_at" timestamp with time zone,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_paused" boolean DEFAULT false NOT NULL,
	"donation_url" text,
	"persona_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ballot_order" integer DEFAULT 0 NOT NULL,
	"status" "candidate_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "candidates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" uuid PRIMARY KEY NOT NULL,
	"candidate_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"evidence" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "claim_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"subject_type" "conversation_subject_type" NOT NULL,
	"subject_id" uuid NOT NULL,
	"owner_user_id" text,
	"anon_session_id" text,
	"summary" text,
	"topic_tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversations_exactly_one_owner" CHECK (("conversations"."owner_user_id" IS NOT NULL) <> ("conversations"."anon_session_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "elections" (
	"id" uuid PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"date" date NOT NULL,
	"state" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "elections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ingestion_runs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"scope" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"stats" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"report_md" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jurisdictions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"type" "jurisdiction_type" NOT NULL,
	"parent_id" uuid,
	"boundary" geometry(MultiPolygon, 4326),
	"census_geoid" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jurisdictions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "measure_arguments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"measure_id" uuid NOT NULL,
	"side" "measure_side" NOT NULL,
	"kind" "measure_argument_kind" NOT NULL,
	"author" text,
	"statement" text NOT NULL,
	"excerpt" text,
	"source_id" uuid,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"citations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"blocked_topic_id" uuid,
	"model" text,
	"input_tokens" integer,
	"output_tokens" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "position_mappings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"subject_type" "mapping_subject_type" NOT NULL,
	"subject_id" uuid NOT NULL,
	"statement_id" uuid NOT NULL,
	"stance" smallint NOT NULL,
	"rationale" text NOT NULL,
	"source_id" uuid,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "position_mappings_stance_range" CHECK ("position_mappings"."stance" BETWEEN -2 AND 2)
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"role" "user_role" DEFAULT 'voter' NOT NULL,
	"zip" text,
	"address_hash" text,
	"jurisdiction_ids" uuid[],
	"interest_tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "races" (
	"id" uuid PRIMARY KEY NOT NULL,
	"election_id" uuid NOT NULL,
	"jurisdiction_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"office" text NOT NULL,
	"district_label" text,
	"seats" smallint,
	"partisan" boolean NOT NULL,
	"ranked_choice" boolean DEFAULT false NOT NULL,
	"ballot_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "races_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"canonical_url" text NOT NULL,
	"publisher" text,
	"tier" "source_tier" NOT NULL,
	"published_at" date,
	"retrieved_at" timestamp with time zone,
	"content_sha256" text,
	"archived_blob_key" text,
	"red_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sources_canonical_url_unique" UNIQUE("canonical_url")
);
--> statement-breakpoint
CREATE TABLE "uploads" (
	"id" uuid PRIMARY KEY NOT NULL,
	"candidate_id" uuid NOT NULL,
	"blob_key" text NOT NULL,
	"filename" text NOT NULL,
	"mime" text NOT NULL,
	"size" integer NOT NULL,
	"sha256" text NOT NULL,
	"extracted_text_status" "extraction_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "values_statements" (
	"id" uuid PRIMARY KEY NOT NULL,
	"topic" text NOT NULL,
	"text" text NOT NULL,
	"display_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"subject_type" text NOT NULL,
	"subject_id" uuid NOT NULL,
	"status" "verification_status" NOT NULL,
	"checks_failed" text[] DEFAULT '{}'::text[] NOT NULL,
	"note" text,
	"verifier" "verifier_kind" NOT NULL,
	"model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voter_values" (
	"user_id" text NOT NULL,
	"statement_id" uuid NOT NULL,
	"answer" smallint NOT NULL,
	"weight" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "voter_values_user_id_statement_id_pk" PRIMARY KEY("user_id","statement_id"),
	CONSTRAINT "voter_values_answer_range" CHECK ("voter_values"."answer" BETWEEN -2 AND 2),
	CONSTRAINT "voter_values_weight_range" CHECK ("voter_values"."weight" BETWEEN 0 AND 3)
);
--> statement-breakpoint
ALTER TABLE "alignment_scores" ADD CONSTRAINT "alignment_scores_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ballot_measures" ADD CONSTRAINT "ballot_measures_election_id_elections_id_fk" FOREIGN KEY ("election_id") REFERENCES "public"."elections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ballot_measures" ADD CONSTRAINT "ballot_measures_jurisdiction_id_jurisdictions_id_fk" FOREIGN KEY ("jurisdiction_id") REFERENCES "public"."jurisdictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_topics" ADD CONSTRAINT "blocked_topics_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_items" ADD CONSTRAINT "candidate_items_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_items" ADD CONSTRAINT "candidate_items_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_items" ADD CONSTRAINT "candidate_items_upload_id_uploads_id_fk" FOREIGN KEY ("upload_id") REFERENCES "public"."uploads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jurisdictions" ADD CONSTRAINT "jurisdictions_parent_id_jurisdictions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."jurisdictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measure_arguments" ADD CONSTRAINT "measure_arguments_measure_id_ballot_measures_id_fk" FOREIGN KEY ("measure_id") REFERENCES "public"."ballot_measures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measure_arguments" ADD CONSTRAINT "measure_arguments_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_blocked_topic_id_blocked_topics_id_fk" FOREIGN KEY ("blocked_topic_id") REFERENCES "public"."blocked_topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_mappings" ADD CONSTRAINT "position_mappings_statement_id_values_statements_id_fk" FOREIGN KEY ("statement_id") REFERENCES "public"."values_statements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_mappings" ADD CONSTRAINT "position_mappings_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "races" ADD CONSTRAINT "races_election_id_elections_id_fk" FOREIGN KEY ("election_id") REFERENCES "public"."elections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "races" ADD CONSTRAINT "races_jurisdiction_id_jurisdictions_id_fk" FOREIGN KEY ("jurisdiction_id") REFERENCES "public"."jurisdictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voter_values" ADD CONSTRAINT "voter_values_statement_id_values_statements_id_fk" FOREIGN KEY ("statement_id") REFERENCES "public"."values_statements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_calls_route_created_idx" ON "ai_calls" USING btree ("route","created_at");--> statement-breakpoint
CREATE INDEX "alignment_scores_candidate_idx" ON "alignment_scores" USING btree ("candidate_id","computed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "audit_log_subject_seq_uq" ON "audit_log" USING btree ("subject_type","subject_id","seq");--> statement-breakpoint
CREATE INDEX "ballot_measures_election_jurisdiction_idx" ON "ballot_measures" USING btree ("election_id","jurisdiction_id");--> statement-breakpoint
CREATE INDEX "ballot_measures_status_idx" ON "ballot_measures" USING btree ("status");--> statement-breakpoint
CREATE INDEX "blocked_topics_candidate_idx" ON "blocked_topics" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "candidate_items_candidate_idx" ON "candidate_items" USING btree ("candidate_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "candidate_items_candidate_hash_uq" ON "candidate_items" USING btree ("candidate_id","content_hash");--> statement-breakpoint
CREATE INDEX "candidate_items_fts_idx" ON "candidate_items" USING gin (to_tsvector('english', coalesce("topic", '') || ' ' || "statement" || ' ' || coalesce("excerpt", '')));--> statement-breakpoint
CREATE INDEX "candidates_race_idx" ON "candidates" USING btree ("race_id","ballot_order");--> statement-breakpoint
CREATE INDEX "candidates_owner_idx" ON "candidates" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "candidates_status_idx" ON "candidates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "claims_candidate_idx" ON "claims" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "claims_status_idx" ON "claims" USING btree ("status");--> statement-breakpoint
CREATE INDEX "conversations_owner_idx" ON "conversations" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "conversations_anon_idx" ON "conversations" USING btree ("anon_session_id");--> statement-breakpoint
CREATE INDEX "conversations_subject_idx" ON "conversations" USING btree ("subject_type","subject_id");--> statement-breakpoint
CREATE INDEX "jurisdictions_parent_idx" ON "jurisdictions" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "jurisdictions_boundary_gist" ON "jurisdictions" USING gist ("boundary");--> statement-breakpoint
CREATE INDEX "measure_arguments_measure_idx" ON "measure_arguments" USING btree ("measure_id","side");--> statement-breakpoint
CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "position_mappings_subject_statement_uq" ON "position_mappings" USING btree ("subject_type","subject_id","statement_id");--> statement-breakpoint
CREATE INDEX "races_election_jurisdiction_idx" ON "races" USING btree ("election_id","jurisdiction_id");--> statement-breakpoint
CREATE INDEX "verifications_subject_idx" ON "verifications" USING btree ("subject_type","subject_id","created_at");