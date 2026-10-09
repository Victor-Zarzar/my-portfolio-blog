import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const notification = pgTable("notification", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  severity: text("severity")
    .$type<"info" | "success" | "warning" | "error">()
    .notNull()
    .default("info"),
  data: jsonb("data").$type<Record<string, unknown>>(),
  href: text("href"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
