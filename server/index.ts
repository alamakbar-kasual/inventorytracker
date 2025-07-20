import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Function to run database seeding asynchronously after server starts
async function runDatabaseSeeding() {
  try {
    // Wait a bit to ensure database connection is ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { seedDatabase } = await import("./seed");
    const { seedUsers } = await import("./userSeed");
    
    console.log("Starting database seeding...");
    await seedDatabase();
    console.log("Database seeding completed");
    
    console.log("Starting user seeding...");
    await seedUsers();
    console.log("User seeding completed");
    
    // Create database indexes for performance
    const { createIndexes } = await import("./db-indexes");
    await createIndexes();
  } catch (error) {
    console.error("Seeding error:", error);
    // Continue without seeding if there's an error
    console.log("Continuing without seeding...");
  }
}

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error("Error occurred:", err);
    console.error("Request URL:", req.url);
    console.error("Request method:", req.method);
    
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Check if request expects HTML (browser request)
    const acceptHeader = req.get('Accept') || '';
    if (acceptHeader.includes('text/html')) {
      // Send a simple HTML error page instead of JSON
      res.status(status).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Error ${status}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; }
              h1 { color: #e53e3e; }
              pre { background: #f7f7f7; padding: 10px; border-radius: 4px; }
            </style>
          </head>
          <body>
            <h1>Error ${status}</h1>
            <p>${message}</p>
            ${process.env.NODE_ENV === 'development' ? `<pre>${err.stack}</pre>` : ''}
          </body>
        </html>
      `);
    } else {
      // Send JSON for API requests
      res.status(status).json({ message });
    }
  });



  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Database seeding disabled - uncomment the line below to seed sample data
    // runDatabaseSeeding();
  });
})();
