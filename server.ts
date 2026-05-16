import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import Stripe from 'stripe';
import OpenAI from 'openai';
import { GoogleGenAI, Modality, ThinkingLevel, Type } from '@google/genai';
import axios from 'axios';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getDb } from './db.js';

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

  const getValidKey = (key: any) => {
    if (!key || typeof key !== 'string') return null;
    const cleaned = key.trim().replace(/['"]/g, '').replace(/[\u200B-\u200D\uFEFF]/g, ''); 
    if (!cleaned || cleaned === "undefined" || cleaned === "null" || cleaned === "MY_GEMINI_API_KEY" || cleaned === "AIzaSyBdP0lp68wHlKyfTd9qW0eS8KWFWyAprME") return null;
    return cleaned;
  };

  // Initialize AI Clients
  const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  const stabilityApiKey = process.env.STABILITY_API_KEY;
  
  // Prefer AIza key if multiple are defined
  let geminiApiKey = getValidKey(process.env.GEMINI_API_KEY);
  if (!geminiApiKey || !geminiApiKey.startsWith('AIza')) {
     const altKey = getValidKey(process.env.API_KEY) || getValidKey(process.env.VITE_GEMINI_API_KEY);
     if (altKey && altKey.startsWith('AIza')) geminiApiKey = altKey;
  }
  if (!geminiApiKey) geminiApiKey = getValidKey(process.env.API_KEY) || getValidKey(process.env.VITE_GEMINI_API_KEY);
  console.log("GEMINI_API_KEY from process.env:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0,5) + "... len:" + process.env.GEMINI_API_KEY.length : "missing");
  console.log("VITE_GEMINI_API_KEY from process.env:", process.env.VITE_GEMINI_API_KEY ? process.env.VITE_GEMINI_API_KEY.substring(0,5) + "... len:" + process.env.VITE_GEMINI_API_KEY.length : "missing");
  console.log("Cleaned geminiApiKey:", geminiApiKey ? geminiApiKey.substring(0,5) + "... len:" + geminiApiKey.length : "missing");
  const gemini = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;
  if (gemini) {
    console.log("Gemini client initialized with API key:", geminiApiKey ? geminiApiKey.substring(0,5) + "... len:" + geminiApiKey.length : "missing");
  }

  if (!process.env.OPENAI_API_KEY) console.warn('⚠️ OPENAI_API_KEY is missing');
  if (!process.env.STABILITY_API_KEY) console.warn('⚠️ STABILITY_API_KEY is missing');
  if (!geminiApiKey) console.warn('⚠️ GEMINI_API_KEY is missing');

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

  app.get('/api/debug/keys', (req, res) => {
    // Collect all env vars that might be an API key (starts with AIza...)
    const possibleKeys = Object.entries(process.env)
        .filter(([_, value]) => value && value.startsWith('AIza'))
        .map(([key, value]) => ({ key, prefix: value!.substring(0, 5) }));

    res.json({
      geminiApiKeyLen: geminiApiKey?.length || 0,
      geminiApiKeyPrefix: geminiApiKey?.substring(0, 5) || 'none',
      viteGeminiKeyLen: process.env.VITE_GEMINI_API_KEY?.length || 0,
      geminiApiKeyLenActual: geminiApiKey?.length || 0,
      possibleKeys: possibleKeys
    });
  });

  // Gemini API Proxy
  app.post('/api/gemini/generateContent', async (req, res) => {
    if (!gemini) return res.status(500).json({ error: 'Gemini API is not configured on the server.' });
    try {
      const { model, contents, config } = req.body;
      const response = await gemini.models.generateContent({ model, contents, config });
      res.json({
        text: response.text,
        candidates: response.candidates
      });
    } catch (error: any) {
      const statusCode = error?.status || 500;
      if (statusCode !== 400 && !error?.message?.includes("API key not valid")) {
        console.error("Gemini server error generateContent:", error);
      }
      res.status(statusCode).json({ error: error.message || 'Gemini error' });
    }
  });

  app.post('/api/gemini/generateVideos', async (req, res) => {
    if (!gemini) return res.status(500).json({ error: 'Gemini API is not configured on the server.' });
    try {
      const { model, prompt, config } = req.body;
      const response = await gemini.models.generateVideos({ model, prompt, config });
      res.json(response);
    } catch (error: any) {
      const statusCode = error?.status || 500;
      if (statusCode !== 400 && !error?.message?.includes("API key not valid")) {
        console.error("Gemini server error generateVideos:", error);
      }
      res.status(statusCode).json({ error: error.message || 'Gemini error' });
    }
  });

  app.get('/api/gemini/downloadVideo', async (req, res) => {
    if (!gemini) return res.status(500).json({ error: 'Gemini API is not configured on the server.' });
    try {
      const { uri } = req.query;
      const response = await fetch(uri as string, {
        headers: { 'x-goog-api-key': geminiApiKey }
      });
      if (!response.ok) throw new Error("Failed to download video");
      res.setHeader('Content-Type', 'video/mp4');
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error("Gemini video download error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app.get('/api/gemini/operations/*', async (req, res) => {
    if (!gemini) return res.status(500).json({ error: 'Gemini API is not configured on the server.' });
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/operations/${req.params[0]}`, {
        headers: { 'x-goog-api-key': geminiApiKey }
      });
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
       console.error("Gemini operation error:", error);
       res.status(error?.status || 500).json({ error: error.message });
    }
  });
  app.post('/api/gemini/chat', async (req, res) => {
    if (!gemini) return res.status(500).json({ error: 'Gemini API is not configured on the server.' });
    try {
      const { model, config, history, message } = req.body;
      const chat = gemini.chats.create({ model, config, history });
      const response = await chat.sendMessage({ message });
      res.json({
        text: response.text,
        candidates: response.candidates
      });
    } catch (error: any) {
      const statusCode = error?.status || 500;
      if (statusCode !== 400 && !error?.message?.includes("API key not valid")) {
        console.error("Gemini server error chat:", error);
      }
      res.status(statusCode).json({ error: error.message || 'Gemini error' });
    }
  });

  // Local SQLite API
  app.post('/api/sync-user', async (req, res) => {
    const { id, name, email, avatar_url } = req.body;
    try {
      const dbSQLite = await getDb();
      await dbSQLite.run(
        `INSERT INTO users (id, name, email, avatar_url) VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name=excluded.name, email=excluded.email, avatar_url=excluded.avatar_url`,
        [id, name, email, avatar_url]
      );
      res.json({ success: true });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/career/progress/:userId', async (req, res) => {
    try {
      const dbSQLite = await getDb();
      const progress = await dbSQLite.get('SELECT * FROM career_progress WHERE user_id = ?', [req.params.userId]);
      if (!progress) {
        return res.json({ points: 0, weekly_points: 0, authorized: false });
      }
      res.json({
        userId: progress.user_id,
        points: progress.points,
        weeklyPoints: progress.weekly_points,
        authorized: Boolean(progress.authorized),
        rankId: progress.rank_id,
        lastPromotionCheck: progress.last_promotion_check,
        trend: progress.trend,
        avatar: progress.avatar,
        name: progress.name,
        activityPoints: progress.activity_points,
        lastActivity: progress.last_activity,
        lastReset: progress.last_reset,
        updatedAt: progress.updated_at
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/career/progress', async (req, res) => {
    const { userId, rankId, weeklyPoints, lastPromotionCheck, trend, lastReset } = req.body;
    try {
      const dbSQLite = await getDb();
      await dbSQLite.run(
        `UPDATE career_progress SET 
         rank_id = coalesce(?, rank_id), 
         weekly_points = coalesce(?, weekly_points), 
         last_promotion_check = coalesce(?, last_promotion_check), 
         trend = coalesce(?, trend),
         last_reset = coalesce(?, last_reset),
         updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [rankId, weeklyPoints, lastPromotionCheck, trend, lastReset, userId]
      );
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/career/history', async (req, res) => {
    const { userId, monthId, points, rankId } = req.body;
    try {
      const dbSQLite = await getDb();
      await dbSQLite.run(
        `INSERT INTO career_progress_history (user_id, month_id, points, rank_id) 
         VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING`,
         [userId, monthId, points, rankId]
      );
      res.json({ success: true });
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/career/progress', async (req, res) => {
    const { userId, pointsToAdd } = req.body;
    if (!userId || !pointsToAdd) return res.status(400).json({ error: 'Missing userId or pointsToAdd' });
    try {
      const dbSQLite = await getDb();
      // Insert if not exists
      await dbSQLite.run(
        `INSERT INTO career_progress (user_id, points, weekly_points, authorized) VALUES (?, ?, ?, 0)
         ON CONFLICT(user_id) DO UPDATE SET 
         points = points + excluded.points,
         weekly_points = weekly_points + excluded.points`,
        [userId, pointsToAdd, pointsToAdd]
      );
      
      const updated = await dbSQLite.get('SELECT * FROM career_progress WHERE user_id = ?', [userId]);
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/career/leaderboard', async (req, res) => {
    try {
      const dbSQLite = await getDb();
      const leaderboard = await dbSQLite.all(`
        SELECT u.id, u.name as displayName, u.avatar_url as photoURL, 
               c.points, c.weekly_points as weeklyPoints, c.rank_id as rankId, 
               c.authorized, c.stars
        FROM career_progress c
        LEFT JOIN users u ON c.user_id = u.id
        ORDER BY c.points DESC
      `);
      const mapped = leaderboard.map(l => ({
        id: l.id || 'unknown',
        name: l.displayName || 'Membro da Marinha',
        avatar: l.photoURL || '',
        points: l.points,
        rankId: l.rankId || 1,
        weeklyPoints: l.weeklyPoints,
        stars: l.stars || 0,
        authorized: l.authorized === 1
      }));
      res.json(mapped);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/games/leaderboard', async (req, res) => {
    try {
      const type = req.query.type || 'totalScore';
      let orderBy = 'total_score';
      if (type === 'battlesWon') orderBy = 'battles_won';
      if (type === 'panoramaScore') orderBy = 'panorama_score';
      
      const dbSQLite = await getDb();
      console.log(`[API Leaderboard] Querying with order: ${orderBy}`);
      const leaderboard = await dbSQLite.all(`SELECT * FROM quiz_leaderboard ORDER BY ${orderBy} DESC LIMIT 20`);
      
      const formatted = leaderboard.map(l => ({
        userId: l.user_id,
        name: l.name,
        avatar: l.avatar,
        totalScore: l.total_score,
        questionsAnswered: l.questions_answered,
        battlesWon: l.battles_won,
        panoramaScore: l.panorama_score
      }));
      res.json(formatted);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/games/leaderboard', async (req, res) => {
    const { userId, name, avatar, totalScore, questionsAnswered, battlesWon, panoramaScore } = req.body;
    try {
      const dbSQLite = await getDb();
      await dbSQLite.run(`
        INSERT INTO quiz_leaderboard (user_id, name, avatar, total_score, questions_answered, battles_won, panorama_score)
        VALUES (?, ?, ?, COALESCE(?,0), COALESCE(?,0), COALESCE(?,0), COALESCE(?,0))
        ON CONFLICT(user_id) DO UPDATE SET
          name = COALESCE(excluded.name, name),
          avatar = COALESCE(excluded.avatar, avatar),
          total_score = total_score + COALESCE(excluded.total_score, 0),
          questions_answered = questions_answered + COALESCE(excluded.questions_answered, 0),
          battles_won = battles_won + COALESCE(excluded.battles_won, 0),
          panorama_score = panorama_score + COALESCE(excluded.panorama_score, 0),
          updated_at = CURRENT_TIMESTAMP
      `, [userId, name, avatar, totalScore, questionsAnswered, battlesWon, panoramaScore]);
      res.json({ success: true });
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/games/leaderboard/:userId', async (req, res) => {
    try {
      const dbSQLite = await getDb();
      const user = await dbSQLite.get(`SELECT * FROM quiz_leaderboard WHERE user_id = ?`, [req.params.userId]);
      if (!user) return res.json(null);
      res.json({
        userId: user.user_id,
        name: user.name,
        avatar: user.avatar,
        totalScore: user.total_score,
        questionsAnswered: user.questions_answered,
        battlesWon: user.battles_won,
        panoramaScore: user.panorama_score
      });
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  
  app.post('/api/games/score', async (req, res) => {
    const { userId, gameName, score } = req.body;
    try {
      const dbSQLite = await getDb();
      await dbSQLite.run('INSERT INTO game_scores (user_id, game_name, score) VALUES (?, ?, ?)', [userId, gameName, score]);
      // Also update career points automatically
      await dbSQLite.run(
        `INSERT INTO career_progress (user_id, points, weekly_points, authorized) VALUES (?, ?, ?, 0)
         ON CONFLICT(user_id) DO UPDATE SET 
         points = points + excluded.points,
         weekly_points = weekly_points + excluded.points`,
        [userId, score, score]
      );
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/quiz/score', async (req, res) => {
    const { userId, quizId, score } = req.body;
    try {
      const dbSQLite = await getDb();
      await dbSQLite.run('INSERT INTO quiz_scores (user_id, quiz_id, score) VALUES (?, ?, ?)', [userId, quizId, score]);
      // Also update career points automatically
      await dbSQLite.run(
        `INSERT INTO career_progress (user_id, points, weekly_points, authorized) VALUES (?, ?, ?, 0)
         ON CONFLICT(user_id) DO UPDATE SET 
         points = points + excluded.points,
         weekly_points = weekly_points + excluded.points`,
        [userId, score, score]
      );
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
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

  // Only use production mode if index.html exists in dist
  const distPath = path.resolve(process.cwd(), 'dist');
  const distIndexHtml = path.resolve(distPath, 'index.html');
  const isProd = fs.existsSync(distIndexHtml);
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
        console.log(`[Debug] Trying to serve. isProd: ${isProd}, vite defined: ${!!vite}`);
        
        // Always try to find an index.html, prefer dist then root
        let indexPath = distIndexHtml;
        if (!fs.existsSync(indexPath)) {
          indexPath = path.resolve(process.cwd(), 'index.html');
        }

        if (vite) {
          // Development / Vite mode
          template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
        } else if (fs.existsSync(indexPath)) {
          // Production / Static mode
          template = fs.readFileSync(indexPath, 'utf-8');
        } else {
          throw new Error(`index.html not found at ${indexPath}`);
        }

        // Inject runtime environment variables for the frontend
        const runtimeEnv: Record<string, string> = {};
        
        // Inject all VITE_ variables from process.env except API keys
        Object.keys(process.env).forEach(key => {
          if (key.startsWith('VITE_') && !key.includes('GEMINI_API_KEY')) {
            runtimeEnv[key] = process.env[key] || "";
          }
        });

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
