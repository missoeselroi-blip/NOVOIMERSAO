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

  app.use(express.json());

  // Request logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  let vite: any;
  let vitePromise: Promise<void> | null = null;

  const initVite = async () => {
    if (vitePromise) return vitePromise;
    vitePromise = (async () => {
      try {
        console.log("Starting Vite...");
        vite = await createViteServer({
          server: { 
            middlewareMode: true, 
            hmr: false,
            host: '0.0.0.0'
          },
          appType: "spa",
        });
        console.log("Vite is ready.");
      } catch (err) {
        console.error("Failed to start Vite:", err);
        vitePromise = null; // Allow retry
        throw err;
      }
    })();
    return vitePromise;
  };

  // Middleware to wait for Vite
  app.use(async (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    
    try {
      if (!vite) {
        await initVite();
      }
      return vite.middlewares(req, res, next);
    } catch (err) {
      console.error("Vite middleware error:", err);
      res.status(503).send("Servidor em inicialização. Por favor, aguarde e atualize a página.");
    }
  });

  app.get("*", async (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    if (req.method !== 'GET' || !req.accepts('html')) return next();

    try {
      if (!vite) await initVite();
      
      const indexPath = path.resolve(__dirname, 'index.html');
      if (!fs.existsSync(indexPath)) {
        return res.status(404).send('index.html not found');
      }

      let template = fs.readFileSync(indexPath, 'utf-8');
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
      
      if (apiKey) {
        template = template.replace(
          '</head>',
          `<script>window.GEMINI_API_KEY = ${JSON.stringify(apiKey)};</script></head>`
        );
      }
      
      const html = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      if (vite) vite.ssrFixStacktrace(e as any);
      next(e);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
    initVite().catch(err => {
      console.error("Initial Vite startup failed:", err);
    });
  });
}

startServer().catch(err => {
  console.error("Critical server failure:", err);
  process.exit(1);
});
