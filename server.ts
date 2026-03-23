import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // Only use production mode if NODE_ENV is production AND dist/index.html folder exists
  const distPath = path.resolve(process.cwd(), 'dist');
  const distIndexHtml = path.resolve(distPath, 'index.html');
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(distIndexHtml);
  const PORT = Number(process.env.PORT) || 3000;

  try {
    let vite;
    if (!isProd) {
      console.log('Starting in DEVELOPMENT mode (Vite middleware)');
      // Vite middleware for development
      vite = await createViteServer({
        server: { 
          middlewareMode: true,
          hmr: false 
        },
        appType: 'custom',
      });
      app.use(vite.middlewares);
    } else {
      console.log('Starting in PRODUCTION mode (Serving static files)');
      // Serve static files in production
      console.log(`Serving static files from: ${distPath}`);
      app.use(express.static(distPath));
    }

    // Serve index.html for all non-API routes
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;

      // Skip API routes or static files that should be handled by express.static or vite
      if (url.startsWith('/api/') || (url.includes('.') && !url.endsWith('.html'))) {
        return next();
      }

      try {
        let template;
        if (!isProd && vite) {
          const indexPath = path.resolve(process.cwd(), 'index.html');
          if (!fs.existsSync(indexPath)) {
            throw new Error(`Development index.html not found at ${indexPath}`);
          }
          template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
        } else {
          if (!fs.existsSync(distIndexHtml)) {
            throw new Error(`Production index.html not found at ${distIndexHtml}`);
          }
          template = fs.readFileSync(distIndexHtml, 'utf-8');
        }

        // Inject runtime environment variables for the frontend
        const rawKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
        const maskedKey = rawKey ? `${rawKey.substring(0, 4)}...${rawKey.substring(rawKey.length - 4)}` : "NOT_FOUND";
        console.log(`Injected API Key to frontend: ${maskedKey} (Length: ${rawKey.length})`);

        const runtimeEnv = {
          VITE_GEMINI_API_KEY: rawKey,
        };
        const envScript = `<script>window.RUNTIME_ENV = ${JSON.stringify(runtimeEnv)};</script>`;
        template = template.replace('</head>', `${envScript}</head>`);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        if (!isProd && vite && e instanceof Error) {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running in ${isProd ? 'production' : 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
