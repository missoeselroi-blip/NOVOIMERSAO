import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

let vite: any;
let isViteReady = false;

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", viteReady: isViteReady });
});

// Middleware to handle requests before Vite is ready or for production
app.use((req, res, next) => {
  if (isViteReady || req.path.startsWith('/api')) {
    return next();
  }
  
  if (process.env.NODE_ENV === "production") {
    return next(); // Let static middleware handle it
  }

  // Return a simple loading page to satisfy the proxy and inform the user
  res.status(200).send(`
    <html>
      <head>
        <title>Carregando Imersão Bíblica...</title>
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f0; color: #1f2937; }
          .loader { text-align: center; max-width: 400px; padding: 20px; }
          .spinner { border: 4px solid rgba(0,0,0,0.1); border-left-color: #059669; border-radius: 50%; width: 48px; height: 48px; animation: spin 1s linear infinite; margin: 0 auto 24px; }
          @keyframes spin { to { transform: rotate(360deg); } }
          h1 { font-size: 1.25rem; margin-bottom: 8px; font-weight: 600; }
          p { color: #6b7280; font-size: 0.875rem; }
        </style>
        <meta http-equiv="refresh" content="5">
      </head>
      <body>
        <div class="loader">
          <div class="spinner"></div>
          <h1>Preparando o App...</h1>
          <p>Estamos configurando o ambiente. Esta página irá recarregar automaticamente em instantes.</p>
        </div>
      </body>
    </html>
  `);
});

async function startServer() {
  try {
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import('vite');
      vite = await createViteServer({
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
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
    isViteReady = true;
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

// Start listening immediately
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
  startServer();
});

server.on('error', (err) => {
  console.error("Server error:", err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
