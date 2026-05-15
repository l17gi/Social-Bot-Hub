import { pgTable, serial, integer, varchar, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const socialAccountsTable = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 20 }).notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 30 }),
  sessionData: text("session_data"),
  accessToken: text("access_token"),
  isActive: boolean("is_active").notNull().default(true),
  status: varchar("status", { length: 30 }).notNull().default("active"),
  avatarUrl: text("avatar_url"),
  followersCount: integer("followers_count"),
  extraData: jsonb("extra_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSocialAccountSchema = createInsertSchema(socialAccountsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;
export type SocialAccount = typeof socialAccountsTable.$inferSelect;
