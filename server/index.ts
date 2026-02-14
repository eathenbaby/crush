import { log } from "./vite"; // Assuming log was in index.ts or vite.ts ? Wait, log was defined in index.ts. 
// I need to keep log function or import it. It was exported.
// Let's re-implement log or import if moved. 
// Actually, server/app.ts implemented logging inline.
import { app, httpServer } from "./app";
import { serveStatic } from "./static";

(async () => {
  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      console.log(`serving on port ${port}`);
    },
  );
})();
