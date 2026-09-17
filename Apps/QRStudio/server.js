const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = Number(process.env.PORT || 8787);
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const historyFile = path.join(dataDir, 'generated-qr.json');

fs.mkdirSync(dataDir, { recursive: true });
let history = {};
try { history = JSON.parse(fs.readFileSync(historyFile, 'utf8')); } catch { history = {}; }

function validCodes(value) {
  return Array.isArray(value) && value.length <= 5000 && value.every(code => typeof code === 'string' && code.length > 0 && code.length <= 300);
}

function saveHistory() {
  const temporaryFile = `${historyFile}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(history, null, 2));
  fs.renameSync(temporaryFile, historyFile);
}

app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));
app.post('/api/qr/check', (req, res) => {
  if (!validCodes(req.body?.codes)) return res.status(400).json({ error: 'Liste de QR codes invalide.' });
  const duplicates = req.body.codes.filter(code => history[code]);
  res.json({ duplicates, count: duplicates.length });
});
app.post('/api/qr/mark', (req, res) => {
  if (!validCodes(req.body?.codes)) return res.status(400).json({ error: 'Liste de QR codes invalide.' });
  const now = new Date().toISOString();
  for (const code of req.body.codes) {
    const previous = history[code];
    history[code] = { firstGeneratedAt: previous?.firstGeneratedAt || now, lastGeneratedAt: now, generationCount: (previous?.generationCount || 0) + 1 };
  }
  saveHistory();
  res.json({ saved: req.body.codes.length });
});
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  maxAge: 0,
  setHeaders: res => res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
}));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(port, '0.0.0.0', () => console.log(`QR Studio listening on ${port}`));
