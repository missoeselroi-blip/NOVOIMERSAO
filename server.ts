import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log('Starting server initialization...');

  try {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
        hmr: false // Disable HMR as per guidelines
      },
      appType: 'spa',
    });

    console.log('Vite server created successfully.');

    // Use vite's connect instance as middleware
    app.use((req, res, next) => {
      console.log(`Incoming request: ${req.method} ${req.url}`);
      next();
    });
    app.use(vite.middlewares);

    // Serve index.html for all non-API routes
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;

      try {
        // 1. Read index.html
        let template = fs.readFileSync(
          path.resolve(process.cwd(), 'index.html'),
          'utf-8'
        );

        // 2. Apply Vite HTML transforms. This injects the Vite client, and also
        //    transforms any HTML provided by Vite plugins.
        template = await vite.transformIndexHtml(url, template);

        // 3. Send the rendered HTML back.
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        // If an error is caught, let Vite fix the stack trace so it maps back
        // to your actual source code.
        if (e instanceof Error) {
          vite.ssrFixStacktrace(e);
        }
        console.error('Error rendering index.html:', e);
        next(e);
      }
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
