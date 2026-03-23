import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start listening immediately to satisfy the proxy
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});

let vite;
let isViteReady = false;
let vitePromise = null;

async function initVite() {
  if (vitePromise) return vitePromise;
  
  vitePromise = (async () => {
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
      isViteReady = true;
      console.log("Vite initialized successfully.");
      return vite;
    } catch (err) {
      console.error("Failed to initialize Vite:", err);
      isViteReady = false;
      throw err;
    }
  })();
  
  return vitePromise;
}

// Middleware to wait for Vite
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  
  if (!isViteReady) {
    try {
      await initVite();
    } catch (err) {
      return res.status(503).send('Servidor em inicialização. Por favor, aguarde alguns segundos e atualize a página.');
    }
  }
  
  if (vite) {
    return vite.middlewares(req, res, next);
  }
  next();
});

app.get("*", async (req, res, next) => {
  if (req.path.startsWith('/api')) return next();

  try {
    const indexPath = path.resolve(__dirname, 'index.html');
    if (!fs.existsSync(indexPath)) {
       return res.status(404).send('index.html not found');
    }

    let template = fs.readFileSync(indexPath, 'utf-8');
    
    // Inject API Key
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
    if (apiKey) {
      template = template.replace(
        '</head>',
        `<script>window.GEMINI_API_KEY = ${JSON.stringify(apiKey)};</script></head>`
      );
    }
    
    if (vite) {
      const html = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } else {
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    }
  } catch (e) {
    if (vite) vite.ssrFixStacktrace(e);
    next(e);
  }
});

// Start listening immediately
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
  initVite().catch(console.error);
});
