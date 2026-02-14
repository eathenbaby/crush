import { db } from "./db";
import { creators, messages, confessions, type Creator, type InsertCreator, type Message, type InsertMessage, type Confession, type InsertConfession } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Creators
  createCreator(creator: InsertCreator): Promise<Creator>;
  getCreatorBySlug(slug: string): Promise<Creator | undefined>;
  getCreatorById(id: number): Promise<Creator | undefined>;

  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesForCreator(creatorId: number): Promise<Message[]>;

  // Confessions
  createConfession(confession: InsertConfession): Promise<Confession>;
  getConfession(id: string): Promise<Confession | undefined>;
  updateConfessionStatus(id: string, response: string): Promise<Confession | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createCreator(insertCreator: InsertCreator): Promise<Creator> {
    const [creator] = await db.insert(creators).values(insertCreator).returning();
    return creator;
  }

  async getCreatorBySlug(slug: string): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.slug, slug));
    return creator;
  }

  async getCreatorById(id: number): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.id, id));
    return creator;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getMessagesForCreator(creatorId: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.creatorId, creatorId))
      .orderBy(desc(messages.senderTimestamp));
  }

  async createConfession(insertConfession: InsertConfession): Promise<Confession> {
    const id = Math.random().toString(36).substring(2, 10); // Simple ID generation
    const [confession] = await db.insert(confessions).values({ ...insertConfession, id }).returning();
    return confession;
  }

  async getConfession(id: string): Promise<Confession | undefined> {
    const [confession] = await db.select().from(confessions).where(eq(confessions.id, id));
    return confession;
  }

  async updateConfessionStatus(id: string, response: string): Promise<Confession | undefined> {
    const [confession] = await db.update(confessions)
      .set({ response })
      .where(eq(confessions.id, id))
      .returning();
    return confession;
  }
}

export const storage = new DatabaseStorage();
