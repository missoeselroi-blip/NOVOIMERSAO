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

  try {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false // Disable HMR as per guidelines
      },
      appType: 'custom',
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);

    // Serve index.html for all non-API routes
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;

      // Ignore requests for files with extensions (should be handled by Vite or return 404)
      if (url.includes('.') && !url.endsWith('.html')) {
        return next();
      }

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
      console.log(`Listening on ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
