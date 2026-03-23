import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

// Start listening IMMEDIATELY to satisfy the proxy
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
  console.log(`GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);
  console.log(`API_KEY present: ${!!process.env.API_KEY}`);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", viteReady: isViteReady, env: process.env.NODE_ENV });
});

// API routes
app.post("/api/contact", (req, res) => {
  res.json({ success: true });
});

let vite;
let isViteReady = false;

// Middleware to handle requests before Vite is ready
app.use((req, res, next) => {
  if (!isViteReady && !req.path.startsWith('/api')) {
    return res.status(200).send(`
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
          <meta http-equiv="refresh" content="3">
        </head>
        <body>
          <div class="loader">
            <div class="spinner"></div>
            <h1>Iniciando aplicação...</h1>
            <p>Estamos preparando o ambiente para você. A página irá recarregar automaticamente em instantes.</p>
          </div>
        </body>
      </html>
    `);
  }
  next();
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite in middleware mode...");
    try {
      const { createServer: createViteServer } = await import('vite');
      vite = await createViteServer({
        server: { 
          middlewareMode: true,
          hmr: false,
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
          vite.ssrFixStacktrace(e);
          next(e);
        }
      });
      
      isViteReady = true;
      console.log("Vite middleware attached and ready.");
    } catch (err) {
      console.error("Vite initialization failed:", err);
    }
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    isViteReady = true;
  }
}

startServer();
