import { app, httpServer } from "../server/app";
import { registerRoutes } from "../server/routes";

// Initialize routes
// Note: Vercel supports top-level await in ESM modules.
// Since package.json has "type": "module", this should work.
await registerRoutes(httpServer, app);

export default app;
