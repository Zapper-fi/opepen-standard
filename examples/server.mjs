import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.cjs':  'application/javascript',
  '.mjs':  'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.json': 'application/json',
};

const root = new URL('..', import.meta.url).pathname;

createServer(async (req, res) => {
  const url = req.url === '/' ? '/examples/random-samples.html' : req.url;
  const filePath = join(root, url);

  try {
    const data = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(8080, () => console.log('Listening on http://localhost:8080'));
