ALTER TABLE "post_translations" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "post_translations_locale_slug_unique" ON "post_translations" USING btree ("locale","slug");
