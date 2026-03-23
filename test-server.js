import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Low-level HTTP server is running on port 3000\n');
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Low-level HTTP server listening on http://0.0.0.0:3000');
});
