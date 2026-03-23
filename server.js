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

let vite;

async function startServer() {
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

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    // Fallback listen if Vite fails
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on http://0.0.0.0:${PORT} (Vite failed)`);
    });
  }
}

startServer();
