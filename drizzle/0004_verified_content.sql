ALTER TABLE "ballot_measures" ADD COLUMN "gaps" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "gaps" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "measure_arguments" ADD COLUMN "topic" text;--> statement-breakpoint
ALTER TABLE "measure_arguments" ADD COLUMN "content_hash" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "measure_arguments_measure_hash_uq" ON "measure_arguments" USING btree ("measure_id","content_hash");