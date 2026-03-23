import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

let isViteReady = false;

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", viteReady: isViteReady });
});

// Start listening immediately
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});

async function startServer() {
  try {
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false },
        appType: "spa",
      });
      
      app.use(vite.middlewares);
      
      app.get("*", async (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        try {
          let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
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
          vite.ssrFixStacktrace(e as any);
          next(e);
        }
      });
    } else {
      const distPath = path.resolve(__dirname, 'dist');
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
    isViteReady = true;
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

startServer();
