/**
 * LZNG server — minimal Express stub.
 *
 * Serves the built dist/ bundle. Auth was removed when the wizard reset;
 * every route in the SPA is public, so no /auth/* endpoint is needed.
 *
 * Run: `node server/index.js` (after `npm run build`).
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
app.disable('x-powered-by');

const distDir = path.resolve(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^\/(?!api).*/, (req, res, next) => {
    const indexHtml = path.join(distDir, 'index.html');
    if (fs.existsSync(indexHtml)) return res.sendFile(indexHtml);
    return next();
  });
} else {
  console.warn(`[lzng] dist/ not found at ${distDir} — run 'npm run build' first.`);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LZNG server listening on :${PORT} (NODE_ENV=${NODE_ENV})`);
});
