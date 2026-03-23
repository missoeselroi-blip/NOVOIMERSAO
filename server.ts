import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Global error handlers to prevent silent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

app.use(express.json());

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

let vite: any;
let isViteReady = false;

// Health check - Move it up so it's always available
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    viteReady: isViteReady, 
    env: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Middleware to handle requests before Vite is ready
app.use((req: any, res: any, next: any) => {
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
  try {
    if (process.env.NODE_ENV !== "production") {
      console.log("Initializing Vite in middleware mode...");
      const { createServer: createViteServer } = await import('vite');
      vite = await createViteServer({
        server: { 
          middlewareMode: true,
          hmr: false,
          host: '0.0.0.0'
        },
        appType: "spa",
      });
      app.use(vite.middlewares);
      
      // Explicitly handle SPA fallback in dev mode
      app.get("*", async (req: any, res: any, next: any) => {
        if (req.path.startsWith('/api')) return next();
        
        const url = req.originalUrl;
        try {
          let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
          
          // Inject API Key as a fallback
          const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
          if (apiKey) {
            template = template.replace(
              '</head>',
              `<script>window.GEMINI_API_KEY = ${JSON.stringify(apiKey)};</script></head>`
            );
          }
          
          const html = await vite.transformIndexHtml(url, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(html);
        } catch (e: any) {
          vite.ssrFixStacktrace(e);
          next(e);
        }
      });
      
      isViteReady = true;
      console.log("Vite middleware attached and ready.");
    } else {
      const distPath = path.resolve(__dirname, "dist");
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get("*", (req: any, res: any) => {
          if (req.path.startsWith('/api')) return next();
          res.sendFile(path.join(distPath, "index.html"));
        });
        isViteReady = true;
        console.log("Production build served from dist.");
      } else {
        console.error("Dist folder not found. Please run build first.");
        isViteReady = false;
      }
    }
  } catch (err) {
    console.error("Server initialization failed:", err);
    isViteReady = false;
  }
}

// Start listening IMMEDIATELY to satisfy the proxy
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
  console.log(`GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);
  console.log(`API_KEY present: ${!!process.env.API_KEY}`);
  
  // Start Vite/Production setup after listening
  startServer();
});
