import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

let vite;
let isViteReady = false;

// Health check - always available
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", viteReady: isViteReady });
});

// Middleware to handle requests before Vite is ready
app.use((req, res, next) => {
  if (isViteReady || req.path.startsWith('/api')) {
    return next();
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

async function startVite() {
  try {
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
    
    app.get("*", async (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        
        // Inject API Key
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
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });

    isViteReady = true;
    console.log("Vite is ready.");
  } catch (err) {
    console.error("Failed to start Vite:", err);
  }
}

// Start listening IMMEDIATELY
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
  startVite();
});
