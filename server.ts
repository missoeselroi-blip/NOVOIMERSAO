import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = Number(process.env.PORT) || 3000;

  try {
    let vite;
    if (!isProd) {
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
      // Serve static files in production
      const distPath = path.resolve(process.cwd(), 'dist');
      app.use(express.static(distPath));
    }

    // Serve index.html for all non-API routes
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;

      if (url.includes('.') && !url.endsWith('.html')) {
        return next();
      }

      try {
        let template;
        if (!isProd && vite) {
          template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
          template = await vite.transformIndexHtml(url, template);
        } else {
          template = fs.readFileSync(path.resolve(process.cwd(), 'dist/index.html'), 'utf-8');
        }

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
