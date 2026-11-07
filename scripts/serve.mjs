// Playwright-free dev server for the DGD solo prototype (Node 18+).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

// Bind to 0.0.0.0 so the server is reachable from any network interface
// (e.g., the game's real device, not just the machine running the server).
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.HOST || '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.map': 'application/json'
};

const server = http.createServer(async (req, res) => {
  try {
    let url = req.url || '/';
    const decoded = decodeURIComponent(url);
    if (decoded !== url) url = decoded;

    const parsed = new URL(url, 'http://localhost');
    const pathname = parsed.pathname;

    if (pathname === '/api/state') {
      try {
        const { state } = await import('../src/core/State.js');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(state));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    let target = decodeURIComponent(pathname);
    // SPA fallback: serve index.html for any non-asset path
    if (!target.startsWith('/assets/') && !target.startsWith('/sprites/') && !target.startsWith('/audio/')) {
      target = '/index.html';
    }

    const filePath = normalize(join(ROOT, target));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    try {
      const data = await readFile(filePath);
      const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type });
      res.end(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
      } else {
        res.writeHead(500);
        res.end(String(err));
      }
    }
  } catch (err) {
    res.writeHead(500);
    res.end(String(err));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`\n  🚴 Don't Get Deactivated! — ready to play`);
  console.log(`  🌐 Local:   http://localhost:${PORT}`);
  console.log(`  🌍 Network: http://<your-ip>:${PORT}`);
  console.log(`  📱 Open one of the URLs above on your device.\n`);
});
