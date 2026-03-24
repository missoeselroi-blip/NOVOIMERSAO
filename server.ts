import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());
  
  // Initialize Stripe
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

  // API Routes
  app.post('/api/create-checkout-session', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured on the server' });
    }

    const { amount, price, description } = req.body;
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    // Cálculo da Taxa de 20% (Inclusa no preço total)
    const totalAmountInCents = Math.round(price * 100);
    const baseAmount = Math.round(totalAmountInCents / 1.20); // Valor sem a taxa
    const feeAmount = totalAmountInCents - baseAmount; // Valor da taxa (20% do valor base)

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: description || 'Créditos de IA',
                description: `Recarga de ${amount} créditos para uso no App`,
              },
              unit_amount: baseAmount,
            },
            quantity: 1,
          },
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: 'Taxa de Serviço (20%)',
                description: 'Taxa de manutenção e processamento inclusa no valor',
              },
              unit_amount: feeAmount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${appUrl}/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/credits?canceled=true`,
        metadata: {
          credits_to_add: amount.toString(),
          base_price: price.toString(),
        }
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: error.message });
    }
  });

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
