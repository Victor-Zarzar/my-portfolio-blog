import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const subscribers = pgTable("subscribers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  locale: text("locale").notNull().default("pt"),
  status: text("status", { enum: ["pending", "confirmed", "unsubscribed"] })
    .notNull()
    .default("pending"),
  confirmTokenHash: text("confirm_token_hash"),
  confirmSentAt: timestamp("confirm_sent_at"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
