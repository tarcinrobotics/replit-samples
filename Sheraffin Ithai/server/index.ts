import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import * as http from 'http';

const port = parseInt(process.env.PORT || "5000");

const findAvailablePort = async (startPort: number): Promise<number> => {
  let currentPort = startPort;
  while (currentPort < startPort + 100) {
    try {
      await new Promise((resolve, reject) => {
        const server = http.createServer();
        server.listen(currentPort, '0.0.0.0');
        server.on('error', reject);
        server.on('listening', () => {
          server.close(resolve);
        });
      });
      return currentPort;
    } catch (err) {
      currentPort++;
    }
  }
  throw new Error('No available ports found');
};

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

(async () => {
  // Initialize storage
  try {
    log("Initializing storage...");
    // Using in-memory storage instead of MongoDB to avoid connection issues
  } catch (error) {
    log(`Error initializing storage: ${error}`);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error(err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const availablePort = await findAvailablePort(port);
  server.listen({
    port: availablePort,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${availablePort}`);
  }).on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      log(`Port ${availablePort} is busy, retrying in 1 second...`);
      setTimeout(() => {
        server.close();
        server.listen({
          port: availablePort,
          host: "0.0.0.0",
          reusePort: true,
        });
      }, 1000);
    }
  });
})();