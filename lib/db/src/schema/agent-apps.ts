import { pgTable, serial, integer, varchar, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const agentAppsTable = pgTable("agent_apps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  instructions: text("instructions").notNull(),
  model: varchar("model", { length: 50 }).notNull().default("claude"),
  tools: jsonb("tools").notNull().default([]),
  isPublic: boolean("is_public").notNull().default(false),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAgentAppSchema = createInsertSchema(agentAppsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAgentApp = z.infer<typeof insertAgentAppSchema>;
export type AgentApp = typeof agentAppsTable.$inferSelect;
