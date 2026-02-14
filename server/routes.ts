import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

declare module 'express-session' {
  interface SessionData {
    creatorId: number;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session setup for inbox access
  app.use(session({
    store: new SessionStore({ checkPeriod: 86400000 }),
    secret: process.env.SESSION_SECRET || 'valentine_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 60 * 1000 // 30 minutes session
    }
  }));

  // === CREATORS ===

  app.post(api.creators.create.path, async (req, res) => {
    try {
      const input = api.creators.create.input.parse(req.body);

      const existing = await storage.getCreatorBySlug(input.slug);
      if (existing) {
        return res.status(409).json({ message: "This Valentine link is already taken." });
      }

      const creator = await storage.createCreator(input);

      // Auto-login on creation
      req.session.creatorId = creator.id;

      res.status(201).json(creator);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.creators.getBySlug.path, async (req, res) => {
    const creator = await storage.getCreatorBySlug(req.params.slug);
    if (!creator) {
      return res.status(404).json({ message: "Valentine link not found" });
    }
    // Don't return passcode!
    const { passcode, ...publicInfo } = creator;
    res.json(publicInfo);
  });

  app.post(api.creators.login.path, async (req, res) => {
    try {
      const input = api.creators.login.input.parse(req.body);
      const creator = await storage.getCreatorBySlug(input.slug);

      if (!creator || creator.passcode !== input.passcode) {
        return res.status(401).json({ message: "Invalid slug or passcode" });
      }

      req.session.creatorId = creator.id;
      res.json({ success: true, creator });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input" });
      }
      throw err;
    }
  });

  // === MESSAGES ===

  app.post(api.messages.send.path, async (req, res) => {
    try {
      const input = api.messages.send.input.parse(req.body);

      // Verify creator exists
      const creator = await storage.getCreatorById(input.creatorId);
      if (!creator) {
        return res.status(404).json({ message: "Creator not found" });
      }

      const message = await storage.createMessage(input);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.messages.list.path, async (req, res) => {
    if (!req.session.creatorId) {
      return res.status(401).json({ message: "Please enter your passcode to view inbox" });
    }

    const requestedId = parseInt(req.params.id);
    if (req.session.creatorId !== requestedId) {
      return res.status(401).json({ message: "Unauthorized access to this inbox" });
    }

    const messages = await storage.getMessagesForCreator(requestedId);
    res.json(messages);
  });

  // SEED DATA
  // Check if we have any creators, if not add a demo one
  const demoSlug = "demo";
  const existingDemo = await storage.getCreatorBySlug(demoSlug);
  if (!existingDemo) {
    const demo = await storage.createCreator({
      displayName: "Romeo",
      slug: demoSlug,
      passcode: "1234"
    });

    // Add sample messages
    await storage.createMessage({
      creatorId: demo.id,
      type: "confession",
      vibe: "coffee",
      content: "I've seen you at the library every Tuesday. Want to grab a coffee sometime?",
      senderDevice: "iPhone 15",
      senderLocation: "Verona, IT"
    });

    await storage.createMessage({
      creatorId: demo.id,
      type: "bouquet",
      bouquetId: "bouquet-01",
      note: "For the most beautiful person I know.",
      senderDevice: "Pixel 8",
      senderLocation: "Mantua, IT"
    });

    console.log("Seed data initialized: demo/1234");
  }

  // === CONFESSIONS ===

  app.post(api.confessions.create.path, async (req, res) => {
    try {
      const input = api.confessions.create.input.parse(req.body);
      const confession = await storage.createConfession(input);
      res.status(201).json(confession);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.confessions.getById.path, async (req, res) => {
    const confession = await storage.getConfession(req.params.id);
    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }
    res.json(confession);
  });

  app.patch(api.confessions.updateStatus.path, async (req, res) => {
    try {
      const { response } = z.object({ response: z.string() }).parse(req.body);
      const confession = await storage.updateConfessionStatus(req.params.id, response);
      if (!confession) {
        return res.status(404).json({ message: "Confession not found" });
      }
      res.json(confession);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input" });
      }
      throw err;
    }
  });

  return httpServer;
}
