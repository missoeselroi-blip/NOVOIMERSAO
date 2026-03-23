import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
// import { createServer as createViteServer } from 'vite'; // Moved to dynamic import inside startServer

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// AI Clients (Lazy Initialization)
let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

function getOpenAI() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is missing");
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

function getAnthropic() {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is missing");
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API routes
  app.post("/api/ai/openai/generate-image", async (req, res) => {
    const { prompt } = req.body;
    try {
      const openai = getOpenAI();
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });
      res.json({ url: response.data[0].url });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/openai/sentiment-analysis", async (req, res) => {
    const { text } = req.body;
    try {
      const openai = getOpenAI();
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é um analista de sentimentos especializado em feedback de usuários cristãos. Analise o texto e retorne um JSON com: sentiment (positivo, neutro, negativo), score (0 a 1) e summary." },
          { role: "user", content: text }
        ],
        response_format: { type: "json_object" }
      });
      res.json(JSON.parse(response.choices[0].message.content || "{}"));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/anthropic/recommendations", async (req, res) => {
    const { userProfile, studyHistory } = req.body;
    try {
      const anthropic = getAnthropic();
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: "Você é um mentor espiritual e professor de teologia. Com base no perfil e histórico do aluno, sugira 3 tópicos de estudo bíblico personalizados. Retorne em formato JSON estruturado.",
        messages: [
          { role: "user", content: `Perfil: ${JSON.stringify(userProfile)}. Histórico: ${JSON.stringify(studyHistory)}` }
        ]
      });
      // Claude doesn't have a direct JSON mode like OpenAI, so we parse the response
      const text = (response.content[0] as any).text;
      res.json({ recommendations: text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/stability/generate-image", async (req, res) => {
    const { prompt } = req.body;
    try {
      const response = await axios.post(
        "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
        {
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
          samples: 1,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          },
        }
      );
      const base64Image = response.data.artifacts[0].base64;
      res.json({ url: `data:image/png;base64,${base64Image}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    const { amount, description } = req.body;
    try {
      // Map amount to price
      let unit_amount = Math.round(1990 * 1.20);
      if (amount === 300) unit_amount = Math.round(4990 * 1.20);
      if (amount === 1000) unit_amount = Math.round(12990 * 1.20);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: 'Créditos de IA',
                description: description,
              },
              unit_amount: unit_amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.APP_URL}/credits?success=true`,
        cancel_url: `${process.env.APP_URL}/credits?canceled=true`,
      });
      res.json({ id: session.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/contact", async (req, res) => {
    // Implement contact logic (e.g., send email)
    console.log(req.body);
    res.json({ success: true });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
