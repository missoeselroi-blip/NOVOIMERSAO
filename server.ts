import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import OpenAI from 'openai';
import axios from 'axios';
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

  // Initialize AI Clients
  const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  const stabilityApiKey = process.env.STABILITY_API_KEY;

  if (!process.env.OPENAI_API_KEY) console.warn('⚠️ OPENAI_API_KEY is missing');
  if (!process.env.STABILITY_API_KEY) console.warn('⚠️ STABILITY_API_KEY is missing');

  // Stripe Webhook - MUST be before express.json()
  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[Webhook] STRIPE_WEBHOOK_SECRET is not set in environment variables!');
      return res.status(400).send('Webhook Error: Secret not configured');
    }

    if (!stripe) {
      console.error('Stripe is not configured');
      return res.status(500).send('Stripe not configured');
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      console.log(`[Webhook] Event verified: ${event.type}`);
    } catch (err: any) {
      console.error(`[Webhook] Signature verification failed: ${err.message}`);
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
  app.get('/api/stripe-config', (req, res) => {
    res.json({
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasPublicKey: !!process.env.VITE_STRIPE_PUBLIC_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test',
      baseUrl: process.env.APP_URL || 'detectada automaticamente',
      appUrlEnv: !!process.env.APP_URL
    });
  });

  app.post(['/api/create-checkout-session', '/api/create-checkout-session/'], async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured on the server' });
    }

    const { amount, price, description, userId } = req.body;
    
    // Forçamos a URL do seu app para evitar o domínio do Google AI Studio
    let baseUrl = process.env.APP_URL || "";
    
    if (!baseUrl) {
      // Tenta detectar via headers de proxy (comum no Cloud Run/AI Studio)
      const forwardedHost = req.headers['x-forwarded-host'] as string;
      const forwardedProto = req.headers['x-forwarded-proto'] as string || 'https';
      
      if (forwardedHost && !forwardedHost.includes('aistudio.google.com')) {
        baseUrl = `${forwardedProto}://${forwardedHost}`;
      } else {
        const host = req.get('host');
        if (host && !host.includes('aistudio.google.com')) {
          baseUrl = `${req.protocol}://${host}`;
        }
      }
    }

    // Fallback de segurança: Se ainda estiver vazio ou for o domínio do AI Studio, 
    // precisamos que o usuário configure o APP_URL nos Secrets.
    if (!baseUrl || baseUrl.includes('aistudio.google.com')) {
      console.warn('⚠️ Base URL não detectada corretamente ou aponta para o AI Studio. Use o segredo APP_URL.');
    }

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

  // AI Routes
  app.post('/api/ai/openai/generate-image', async (req, res) => {
    if (!openai) return res.status(500).json({ error: 'OpenAI is not configured' });
    const { prompt } = req.body;
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
      });
      res.json({ url: response.data[0].url });
    } catch (error: any) {
      console.error('OpenAI Image Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Bible API Proxy
  app.get('/api/bible/*', async (req, res) => {
    const path = req.params[0];
    const query = req.query;
    // Ensure path doesn't have double slashes and handles the bolls.life structure
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const url = `https://bolls.life/${cleanPath}`;
    
    console.log(`[Bible Proxy] Fetching: ${url} with query:`, query);
    
    try {
      const response = await axios.get(url, { 
        params: query,
        timeout: 30000, // Increased to 30 seconds
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
          'Referer': 'https://bolls.life/',
          'Origin': 'https://bolls.life'
        }
      });
      console.log(`[Bible Proxy] Success: ${url} - Status: ${response.status}`);
      res.json(response.data);
    } catch (error: any) {
      // If it's a 404 on translation discovery endpoints, return an empty array silently
      const isDiscovery = cleanPath.includes('translations') || cleanPath.includes('get-translations');
      if (error.response?.status === 404 && isDiscovery) {
        console.warn(`[Bible Proxy] 404 on discovery endpoint: ${url}, returning empty array`);
        return res.json([]);
      }

      console.error(`[Bible Proxy] Error (${url}):`, error.message);
      if (error.response) {
        console.error(`[Bible Proxy] Response Status: ${error.response.status}`);
        // Only log first 200 chars of data if it's HTML
        const data = typeof error.response.data === 'string' 
          ? error.response.data.substring(0, 200) 
          : JSON.stringify(error.response.data).substring(0, 200);
        console.error(`[Bible Proxy] Response Data (truncated):`, data);
      }
      res.status(error.response?.status || 500).json({ 
        error: 'Failed to fetch from Bible API',
        details: error.message 
      });
    }
  });

  app.post('/api/ai/openai/sentiment-analysis', async (req, res) => {
    if (!openai) return res.status(500).json({ error: 'OpenAI is not configured' });
    const { text } = req.body;
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Analyze the sentiment of the following text and return a JSON with 'sentiment' (positive, negative, neutral) and 'score' (0 to 1)." },
          { role: "user", content: text }
        ],
        response_format: { type: "json_object" }
      });
      res.json(JSON.parse(response.choices[0].message.content || '{}'));
    } catch (error: any) {
      console.error('Sentiment Analysis Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/stability/generate-image', async (req, res) => {
    if (!stabilityApiKey) return res.status(500).json({ error: 'Stability AI is not configured' });
    const { prompt } = req.body;
    try {
      const response = await axios.post(
        'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image',
        {
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: 512,
          width: 512,
          samples: 1,
          steps: 30,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${stabilityApiKey}`,
          },
        }
      );
      
      const base64Image = response.data.artifacts[0].base64;
      res.json({ url: `data:image/png;base64,${base64Image}` });
    } catch (error: any) {
      console.error('Stability AI Image Error:', error.response?.data || error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/verify-checkout-session', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured on the server' });
    }

    let { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'ID da sessão ou pagamento é obrigatório.' });
    }

    sessionId = sessionId.trim();

    try {
      console.log(`[Stripe] Verifying ID: ${sessionId}`);
      
      let session: Stripe.Checkout.Session;

      if (sessionId.startsWith('pi_')) {
        // Se o usuário forneceu um Payment Intent ID, buscamos a sessão associada
        console.log(`[Stripe] Searching for session associated with Payment Intent: ${sessionId}`);
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: sessionId,
          limit: 1
        });
        
        if (sessions.data.length === 0) {
          return res.status(404).json({ error: 'Nenhuma sessão de checkout encontrada para este ID de pagamento (pi_...). Verifique se o ID está correto ou use o ID da sessão (cs_...).' });
        }
        session = sessions.data[0];
      } else if (sessionId.startsWith('cs_')) {
        // ID de sessão padrão
        session = await stripe.checkout.sessions.retrieve(sessionId);
      } else {
        return res.status(400).json({ error: 'ID inválido. O ID deve começar com "cs_" (Sessão) ou "pi_" (Pagamento). Verifique o e-mail do Stripe.' });
      }
      
      if (session.payment_status === 'paid') {
        const userId = session.client_reference_id;
        const creditsToAdd = parseInt(session.metadata?.credits_to_add || '0');
        
        if (!userId) {
          console.error('[Stripe] Session has no client_reference_id (userId)');
          return res.status(400).json({ error: 'Sessão encontrada, mas não está vinculada a um usuário. Entre em contato com o suporte.' });
        }

        console.log(`[Stripe] Session ${session.id} is PAID. Adding ${creditsToAdd} credits to user ${userId}`);
        
        res.json({ 
          success: true, 
          credits: creditsToAdd,
          customer_email: session.customer_details?.email 
        });
      } else {
        console.log(`[Stripe] Session ${session.id} status is: ${session.payment_status}`);
        res.json({ 
          success: false, 
          error: `O pagamento ainda está com status: ${session.payment_status}. Se você já pagou, aguarde alguns minutos para o Stripe processar.` 
        });
      }
    } catch (error: any) {
      console.error('[Stripe] Verification error:', error);
      const message = error.type === 'StripeInvalidRequestError' 
        ? 'ID não encontrado no Stripe. Verifique se você copiou o ID correto (cs_... ou pi_...).'
        : 'Erro ao consultar o Stripe. Tente novamente em instantes.';
      res.status(500).json({ error: message });
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
        appType: 'spa',
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
      console.log(`[Server] Request received for: ${url}`);

      // Skip API routes or static files that should be handled by express.static or vite
      // In development, Vite handles .tsx, .ts, .css, etc.
      if (url.startsWith('/api/') || (url.includes('.') && !url.endsWith('.html') && !url.endsWith('.php'))) {
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
        const runtimeEnv: Record<string, string> = {};
        
        // Inject all VITE_ variables from process.env
        Object.keys(process.env).forEach(key => {
          if (key.startsWith('VITE_')) {
            runtimeEnv[key] = process.env[key] || "";
          }
        });

        // Ensure GEMINI_API_KEY is also available if not prefixed
        if (!runtimeEnv.VITE_GEMINI_API_KEY) {
          runtimeEnv.VITE_GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
        }

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
