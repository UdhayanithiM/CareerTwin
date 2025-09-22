// server.cjs
import express from 'express';
import next from 'next';
import { parse } from 'url';

// Determine if the environment is development or production.
const dev = process.env.NODE_ENV !== 'production';
// CRITICAL CHANGE: Listen on 0.0.0.0 for container compatibility
const hostname = '0.0.0.0'; 
// Dynamically read the PORT from the environment variables provided by Cloud Run.
// Fallback to 3000 for local development.
const port = parseInt(process.env.PORT, 10) || 3000;

// Initialize the Next.js app.
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Example of a custom server-side route.
  server.get('/api/custom', (req, res) => {
    return res.json({ message: 'This is a custom route from the Express server.' });
  });

  // All other requests are handled by Next.js.
  server.all('*', (req, res) => {
    const parsedUrl = parse(req.url, true);
    return handle(req, res, parsedUrl);
  });

  // CRITICAL CHANGE: Explicitly listen on the correct hostname
  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Error starting server', err);
  process.exit(1);
});