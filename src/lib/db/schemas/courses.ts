import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const courses = pgTable(
  "courses",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    url: text("url").notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("courses_is_published_idx").on(table.isPublished),
    index("courses_sort_order_idx").on(table.sortOrder),
    index("courses_completed_at_idx").on(table.completedAt),
  ],
);

export const courseTranslations = pgTable(
  "course_translations",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, {
        onDelete: "cascade",
      }),
    locale: varchar("locale", { length: 10 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("course_translations_course_locale_unique").on(
      table.courseId,
      table.locale,
    ),
    index("course_translations_locale_idx").on(table.locale),
  ],
);

export const coursesRelations = relations(courses, ({ many }) => ({
  translations: many(courseTranslations),
}));

export const courseTranslationsRelations = relations(
  courseTranslations,
  ({ one }) => ({
    course: one(courses, {
      fields: [courseTranslations.courseId],
      references: [courses.id],
    }),
  }),
);
