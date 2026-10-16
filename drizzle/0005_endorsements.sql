CREATE TABLE "endorsements" (
	"id" uuid PRIMARY KEY NOT NULL,
	"candidate_id" uuid,
	"measure_id" uuid,
	"side" "measure_side",
	"endorser" text NOT NULL,
	"endorser_type" text NOT NULL,
	"rank" integer,
	"statement" text NOT NULL,
	"excerpt" text,
	"source_id" uuid,
	"endorsed_on" date,
	"content_hash" text NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "endorsements_one_subject" CHECK (("endorsements"."candidate_id" IS NOT NULL AND "endorsements"."measure_id" IS NULL AND "endorsements"."side" IS NULL) OR ("endorsements"."candidate_id" IS NULL AND "endorsements"."measure_id" IS NOT NULL AND "endorsements"."side" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "endorsements" ADD CONSTRAINT "endorsements_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "endorsements" ADD CONSTRAINT "endorsements_measure_id_ballot_measures_id_fk" FOREIGN KEY ("measure_id") REFERENCES "public"."ballot_measures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "endorsements" ADD CONSTRAINT "endorsements_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "endorsements_candidate_idx" ON "endorsements" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "endorsements_measure_idx" ON "endorsements" USING btree ("measure_id","side");--> statement-breakpoint
CREATE UNIQUE INDEX "endorsements_hash_uq" ON "endorsements" USING btree ("content_hash");