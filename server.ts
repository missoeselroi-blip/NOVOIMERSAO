import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Request logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Vite in middleware mode...");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true, 
        hmr: false,
        host: '0.0.0.0'
      },
      appType: "spa",
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);

    // SPA fallback
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;

      // Skip API and files with dots (likely static assets not handled by Vite)
      if (url.startsWith('/api') || url.includes('.')) {
        return next();
      }

      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        
        // Apply Vite HTML transforms
        template = await vite.transformIndexHtml(url, template);

        // Inject API Key
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
        if (apiKey) {
          template = template.replace(
            '</head>',
            `<script>window.GEMINI_API_KEY = ${JSON.stringify(apiKey)};</script></head>`
          );
        }
        
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as any);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical server failure:", err);
  process.exit(1);
});
