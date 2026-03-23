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

async function startServer() {
  try {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true, 
        hmr: false,
        host: '0.0.0.0'
      },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
    
    app.get("*", async (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api')) return next();
      
      // Only handle HTML requests
      if (!req.accepts('html')) return next();

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
        
        const html = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } catch (err) {
    console.error("Failed to start Vite:", err);
  }
}

startServer();
