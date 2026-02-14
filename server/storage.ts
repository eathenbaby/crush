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
    if (!db) throw new Error("Database not initialized");
    const [creator] = await db.insert(creators).values(insertCreator).returning();
    return creator;
  }

  async getCreatorBySlug(slug: string): Promise<Creator | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [creator] = await db.select().from(creators).where(eq(creators.slug, slug));
    return creator;
  }

  async getCreatorById(id: number): Promise<Creator | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [creator] = await db.select().from(creators).where(eq(creators.id, id));
    return creator;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    if (!db) throw new Error("Database not initialized");
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getMessagesForCreator(creatorId: number): Promise<Message[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select()
      .from(messages)
      .where(eq(messages.creatorId, creatorId))
      .orderBy(desc(messages.senderTimestamp));
  }

  async createConfession(insertConfession: InsertConfession): Promise<Confession> {
    if (!db) throw new Error("Database not initialized");
    const id = Math.random().toString(36).substring(2, 10); // Simple ID generation
    const [confession] = await db.insert(confessions).values({ ...insertConfession, id }).returning();
    return confession;
  }

  async getConfession(id: string): Promise<Confession | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [confession] = await db.select().from(confessions).where(eq(confessions.id, id));
    return confession;
  }

  async updateConfessionStatus(id: string, response: string): Promise<Confession | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [confession] = await db.update(confessions)
      .set({ response })
      .where(eq(confessions.id, id))
      .returning();
    return confession;
  }
}


export class MemStorage implements IStorage {
  private users: Map<number, Creator>;
  private messages: Map<number, Message>;
  private confessions: Map<string, Confession>;
  private currentUserId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.confessions = new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;
  }

  async createCreator(insertCreator: InsertCreator): Promise<Creator> {
    const id = this.currentUserId++;
    const creator: Creator = { ...insertCreator, id };
    this.users.set(id, creator);
    return creator;
  }

  async getCreatorBySlug(slug: string): Promise<Creator | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.slug === slug,
    );
  }

  async getCreatorById(id: number): Promise<Creator | undefined> {
    return this.users.get(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { ...insertMessage, id, senderTimestamp: new Date() }; // Add senderTimestamp
    this.messages.set(id, message);
    return message;
  }

  async getMessagesForCreator(creatorId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.creatorId === creatorId)
      .sort((a, b) => {
        const timeA = a.senderTimestamp ? new Date(a.senderTimestamp).getTime() : 0;
        const timeB = b.senderTimestamp ? new Date(b.senderTimestamp).getTime() : 0;
        return timeB - timeA;
      });
  }

  async createConfession(insertConfession: InsertConfession): Promise<Confession> {
    const id = Math.random().toString(36).substring(2, 10);
    const confession: Confession = { ...insertConfession, id, response: null, createdAt: new Date() };
    this.confessions.set(id, confession);
    return confession;
  }

  async getConfession(id: string): Promise<Confession | undefined> {
    return this.confessions.get(id);
  }

  async updateConfessionStatus(id: string, response: string): Promise<Confession | undefined> {
    const confession = this.confessions.get(id);
    if (!confession) return undefined;
    const updated = { ...confession, response };
    this.confessions.set(id, updated);
    return updated;
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
