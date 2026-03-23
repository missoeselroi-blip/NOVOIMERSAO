import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Start listening IMMEDIATELY to satisfy the proxy
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
  console.log(`GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.post("/api/contact", (req, res) => {
  res.json({ success: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite in middleware mode...");
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
          hmr: false, // Disable HMR for this environment
          host: '0.0.0.0',
          port: 3000
        },
        appType: "spa",
      });
      app.use(vite.middlewares);
      
      // Explicitly handle SPA fallback in dev mode if Vite middleware doesn't
      app.get("*", async (req, res, next) => {
        const url = req.originalUrl;
        try {
          const fs = await import('fs');
          const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
          let html = await vite.transformIndexHtml(url, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(html);
        } catch (e) {
          vite.ssrFixStacktrace(e as Error);
          next(e);
        }
      });
      
      console.log("Vite middleware attached.");
    } catch (err) {
      console.error("Vite initialization failed:", err);
    }
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

startServer();
