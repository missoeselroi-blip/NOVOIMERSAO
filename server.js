import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log("Starting ESM server from server.js...");
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Start listening immediately
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`ESM Server listening on http://0.0.0.0:${PORT}`);
  });

  // Vite middleware
  /*
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite middleware...");
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware initialized.");
    } catch (error) {
      console.error("Vite error:", error);
    }
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  */
  app.get("*", (req, res) => {
    res.send("Server is running without Vite middleware. If you see this, Vite is the problem.");
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
