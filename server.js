import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Start listening IMMEDIATELY to satisfy the proxy
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes (placeholder, can be added back later)
app.post("/api/contact", (req, res) => {
  res.json({ success: true });
});

// Now load Vite asynchronously
if (process.env.NODE_ENV !== "production") {
  console.log("Loading Vite...");
  import('vite').then(({ createServer: createViteServer }) => {
    return createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
  }).then(vite => {
    app.use(vite.middlewares);
    console.log("Vite middleware added.");
  }).catch(err => {
    console.error("Vite error:", err);
    app.get("*", (req, res) => {
      res.status(500).send("Vite failed to load. Check server logs.");
    });
  });
} else {
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
