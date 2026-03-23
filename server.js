const express = require('express');
const app = express();
const PORT = 3000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('*', (req, res) => {
  res.send('Minimal Express server with require is running.');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal Express server with require running on http://0.0.0.0:${PORT}`);
});
