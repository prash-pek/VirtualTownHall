CREATE TABLE "source_gaps" (
	"id" uuid PRIMARY KEY NOT NULL,
	"item_key" text NOT NULL,
	"topic" text NOT NULL,
	"uncovered_sides" text[] DEFAULT '{}'::text[] NOT NULL,
	"sides_asked" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "source_gaps_item_created_idx" ON "source_gaps" USING btree ("item_key","created_at");