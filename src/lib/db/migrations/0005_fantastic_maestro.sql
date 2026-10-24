CREATE TABLE "course_translations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "course_translations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"course_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"title" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "courses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"url" text NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_translations" ADD CONSTRAINT "course_translations_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_translations_course_locale_unique" ON "course_translations" USING btree ("course_id","locale");--> statement-breakpoint
CREATE INDEX "course_translations_locale_idx" ON "course_translations" USING btree ("locale");--> statement-breakpoint
CREATE INDEX "courses_is_published_idx" ON "courses" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "courses_sort_order_idx" ON "courses" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "courses_completed_at_idx" ON "courses" USING btree ("completed_at");
