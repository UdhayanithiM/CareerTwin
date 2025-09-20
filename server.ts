// server.ts
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { config } from 'dotenv';

// Load environment variables from .env
config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    // This default handler correctly routes ALL Next.js requests (pages, API, etc.)
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`> Server ready on http://localhost:${port}`);
  });
});