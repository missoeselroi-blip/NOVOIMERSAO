import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API routes
  app.post("/api/create-checkout-session", async (req, res) => {
    const { amount, description } = req.body;
    try {
      // Map amount to price
      let unit_amount = 1990;
      if (amount === 300) unit_amount = 4990;
      if (amount === 1000) unit_amount = 12990;

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
