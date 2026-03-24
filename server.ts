import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let db: any;
const apps = getApps();
if (!apps || apps.length === 0) {
  try {
    let projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    let databaseId = process.env.FIRESTORE_DATABASE_ID;
    
    // Try to read from config file if env is missing
    try {
      const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (!projectId) projectId = config.projectId;
        if (!databaseId) databaseId = config.firestoreDatabaseId;
      }
    } catch (e) {
      console.warn('Could not read firebase-applet-config.json for Admin initialization');
    }

    if (projectId) {
      initializeApp({ projectId });
      console.log(`Firebase Admin initialized successfully for project: ${projectId}`);
      db = getFirestore(databaseId || '(default)');
    } else {
      console.warn('⚠️ Firebase Project ID missing. Admin SDK may not work correctly.');
      db = getFirestore();
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    db = getFirestore();
  }
} else {
  db = getFirestore();
}

async function startServer() {
  const app = express();

  // Initialize Stripe
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.warn('⚠️ STRIPE_SECRET_KEY is missing in environment variables');
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('⚠️ STRIPE_WEBHOOK_SECRET is missing. Webhooks will not work.');
  }
  if (!process.env.APP_URL) {
    console.warn('⚠️ APP_URL is missing. Using request headers as fallback.');
  }
  const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

  // Stripe Webhook - MUST be before express.json()
  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return res.status(400).send('Webhook Error: Secret not set');
    }

    if (!stripe) {
      console.error('Stripe is not configured');
      return res.status(500).send('Stripe not configured');
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const creditsToAdd = parseInt(session.metadata?.credits_to_add || '0');

      if (userId && creditsToAdd > 0) {
        try {
          const userCreditsRef = db.collection('userCredits').doc(userId);
          
          await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(userCreditsRef);
            let currentBalance = 0;
            
            if (doc.exists) {
              currentBalance = doc.data()?.balance || 0;
            }

            const newBalance = currentBalance + creditsToAdd;
            transaction.set(userCreditsRef, {
              userId,
              balance: newBalance,
              lastUpdated: FieldValue.serverTimestamp()
            }, { merge: true });

            // Add transaction record
            const txRef = db.collection('creditTransactions').doc();
            transaction.set(txRef, {
              userId,
              type: 'purchase',
              amount: creditsToAdd,
              description: `Compra via Stripe (Webhook): ${session.id}`,
              date: FieldValue.serverTimestamp()
            });
          });

          console.log(`Successfully added ${creditsToAdd} credits to user ${userId} via webhook`);
        } catch (error) {
          console.error('Error updating credits via webhook:', error);
        }
      }
    }

    res.json({ received: true });
  });

  app.use(express.json());

  // Logging middleware for API routes
  app.use('/api', (req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.post(['/api/create-checkout-session', '/api/create-checkout-session/'], async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured on the server' });
    }

    const { amount, price, description, userId } = req.body;
    
    // Forçamos a URL do seu app para evitar o domínio do Google AI Studio
    let baseUrl = process.env.APP_URL || "";
    
    if (!baseUrl) {
      const host = req.get('host');
      if (host) {
        const protocol = req.protocol;
        baseUrl = `${protocol}://${host}`;
      }
    }
    
    // Tenta detectar se estamos no ambiente de preview (pre)
    const hostHeader = req.get('host') || '';
    if (hostHeader.includes('ais-pre') || (req.headers['x-forwarded-host'] as string)?.includes('ais-pre')) {
      // Se detectarmos que é o ambiente de preview, mas não temos APP_URL, podemos tentar inferir
      // Mas se baseUrl já foi definido via host, ele deve estar correto.
    }
    
    // Se o usuário configurou uma APP_URL válida, ela tem prioridade (já tratada acima)

    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    
    // Usamos rotas limpas no servidor como ponte (sem o #)
    const successUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/payment-cancel`;

    console.log(`[Stripe] Criando checkout:
      - Usuário: ${userId}
      - Base URL: ${baseUrl}
      - Sucesso (Ponte): ${successUrl}`);

    // Cálculo da Taxa de 20% (Inclusa no preço total)
    const totalAmountInCents = Math.round(price * 100);
    const baseAmount = Math.round(totalAmountInCents / 1.20); // Valor sem a taxa
    const feeAmount = totalAmountInCents - baseAmount; // Valor da taxa (20% do valor base)

    try {
      console.log(`Creating checkout session for user ${userId}, amount ${amount}`);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        client_reference_id: userId,
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
        success_url: successUrl,
        cancel_url: cancelUrl,
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

  app.post('/api/verify-checkout-session', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured on the server' });
    }

    const { sessionId } = req.body;

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid') {
        const creditsToAdd = parseInt(session.metadata?.credits_to_add || '0');
        res.json({ 
          success: true, 
          credits: creditsToAdd,
          customer_email: session.customer_details?.email 
        });
      } else {
        res.json({ success: false, error: 'Payment not completed' });
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // 404 handler for API routes
  app.all('/api/*', (req, res) => {
    console.warn(`[API 404] ${req.method} ${req.url}`);
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
  });

  // Global Error Handler for API
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Server Error]', err);
    if (req.path.startsWith('/api/')) {
      return res.status(err.status || 500).json({ 
        error: err.message || 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
    next(err);
  });

  // Bridge Pages for Stripe Redirects (Handles HashRouter in iframes)
  app.get('/payment-success', (req, res) => {
    const sessionId = req.query.session_id;
    res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f9fafb; margin: 0; text-align: center;">
          <h2 style="color: #059669;">Pagamento Confirmado!</h2>
          <p>Sincronizando com o aplicativo...</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'STRIPE_PAYMENT_SUCCESS', 
                sessionId: '${sessionId}' 
              }, '*');
              setTimeout(() => window.close(), 1000);
            } else {
              window.location.href = '/#/credits?success=true&session_id=${sessionId}';
            }
          </script>
        </body>
      </html>
    `);
  });

  app.get('/payment-cancel', (req, res) => {
    res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f9fafb; margin: 0; text-align: center;">
          <h2 style="color: #4b5563;">Pagamento Cancelado</h2>
          <p>Voltando para o aplicativo...</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'STRIPE_PAYMENT_CANCEL' }, '*');
              setTimeout(() => window.close(), 1000);
            } else {
              window.location.href = '/#/credits?canceled=true';
            }
          </script>
        </body>
      </html>
    `);
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
          hmr: false,
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
