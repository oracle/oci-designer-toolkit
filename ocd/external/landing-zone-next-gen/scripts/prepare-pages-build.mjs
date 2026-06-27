import { copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeBasePath } from '../src-lzng/services/pagesBase.js';

export { normalizeBasePath };

export async function copySpaFallback({ distDir = 'dist' } = {}) {
  const sourcePath = path.join(distDir, 'index.html');
  const targetPath = path.join(distDir, '404.html');
  await copyFile(sourcePath, targetPath);
  return targetPath;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
const modulePath = fileURLToPath(import.meta.url);

if (invokedPath === modulePath) {
  await copySpaFallback({ distDir: process.argv[2] || 'dist' });
}
