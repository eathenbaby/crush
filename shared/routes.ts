import { z } from 'zod';
import { insertCreatorSchema, insertMessageSchema, insertConfessionSchema, loginSchema, creators, messages, confessions } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  creators: {
    create: {
      method: 'POST' as const,
      path: '/api/creators' as const,
      input: insertCreatorSchema,
      responses: {
        201: z.custom<typeof creators.$inferSelect>(),
        400: errorSchemas.validation,
        409: z.object({ message: z.string() }), // Conflict (slug exists)
      },
    },
    getBySlug: {
      method: 'GET' as const,
      path: '/api/creators/:slug' as const,
      responses: {
        200: z.object({
          id: z.number(),
          displayName: z.string(),
          slug: z.string()
        }), // Public info only
        404: errorSchemas.notFound,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: loginSchema,
      responses: {
        200: z.object({ success: z.boolean(), creator: z.custom<typeof creators.$inferSelect>() }),
        401: errorSchemas.unauthorized,
      },
    }
  },
  messages: {
    send: {
      method: 'POST' as const,
      path: '/api/messages' as const,
      input: insertMessageSchema,
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/creators/:id/messages' as const, // Protected by session in practice, or we assume client handles auth state
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
  },
  confessions: {
    create: {
      method: 'POST' as const,
      path: '/api/confessions' as const,
      input: insertConfessionSchema,
      responses: {
        201: z.custom<typeof confessions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    getById: {
      method: 'GET' as const,
      path: '/api/confessions/:id' as const,
      responses: {
        200: z.custom<typeof confessions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/confessions/:id/status' as const,
      input: z.object({ response: z.string() }),
      responses: {
        200: z.custom<typeof confessions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type CreateCreatorInput = z.infer<typeof api.creators.create.input>;
export type LoginInput = z.infer<typeof api.creators.login.input>;
export type SendMessageInput = z.infer<typeof api.messages.send.input>;
