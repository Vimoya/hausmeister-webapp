const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
};

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  // .well-known/assetlinks.json braucht keine Extension-Prüfung
  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath) || (urlPath.includes('assetlinks') ? '.json' : '');

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Try index.html as fallback
      fs.readFile(path.join(__dirname, 'index.html'), (e2, d2) => {
        if (e2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(d2);
      });
      return;
    }
    const headers = { 'Content-Type': mime[ext] || 'text/plain' };
    // Service Worker darf nicht gecacht werden
    if (urlPath === '/sw.js') headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    // Manifest kurz cachen
    if (urlPath === '/manifest.json') headers['Cache-Control'] = 'public, max-age=86400';
    res.writeHead(200, headers);
    res.end(data);
  });
}).listen(PORT, () => console.log(`Server running on port ${PORT}`));
