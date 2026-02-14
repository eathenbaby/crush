import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Creators (Users who receive messages)
export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  displayName: text("display_name").notNull(),
  slug: text("slug").notNull().unique(), // The custom URL part (e.g., valentine.app/to/sarah)
  passcode: text("passcode").notNull(), // Simple passcode for inbox access
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages (Confessions or Bouquets)
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull().references(() => creators.id),
  type: text("type").notNull(), // 'confession' | 'bouquet'
  
  // Confession specific
  vibe: text("vibe"), // 'coffee', 'dinner', 'talk', 'adventure', 'romance', 'friends'
  content: text("content"), // The message text
  
  // Bouquet specific
  bouquetId: text("bouquet_id"), // 'bouquet-01' to 'bouquet-06'
  note: text("note"), // Personal note attached to bouquet
  
  // Metadata (for transparency/safety)
  senderDevice: text("sender_device"),
  senderLocation: text("sender_location"),
  senderTimestamp: timestamp("sender_timestamp").defaultNow(),
  
  isRead: boolean("is_read").default(false),
  isArchived: boolean("is_archived").default(false),
});

// === SCHEMAS ===

export const insertCreatorSchema = createInsertSchema(creators).pick({
  displayName: true,
  slug: true,
  passcode: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  creatorId: true,
  type: true,
  vibe: true,
  content: true,
  bouquetId: true,
  note: true,
  senderDevice: true,
  senderLocation: true,
});


// === EXPLICIT API TYPES ===

export type Creator = typeof creators.$inferSelect;
export type InsertCreator = z.infer<typeof insertCreatorSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type CreateLinkRequest = InsertCreator;
export type SendMessageRequest = InsertMessage;

// Response types
export type CreatorResponse = Creator;
export type MessageResponse = Message;

// Login request for inbox
export const loginSchema = z.object({
  slug: z.string(),
  passcode: z.string(),
});
export type LoginRequest = z.infer<typeof loginSchema>;
export type LoginResponse = { success: boolean; creator: Creator };
export const confessions = pgTable("confessions", {
  id: text("id").primaryKey(), // Using nanoid for short/cute URLs
  senderName: text("sender_name").notNull(),
  intentOption: text("intent_option").notNull(),
  message: text("message").notNull(),
  response: text("response"), // 'yes', 'no', 'maybe'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConfessionSchema = createInsertSchema(confessions).pick({
  senderName: true,
  intentOption: true,
  message: true,
});

export type Confession = typeof confessions.$inferSelect;
export type InsertConfession = z.infer<typeof insertConfessionSchema>;
