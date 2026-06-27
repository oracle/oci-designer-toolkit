import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { copySpaFallback, normalizeBasePath } from '../../scripts/prepare-pages-build.mjs';

describe('GitHub Pages build helper', () => {
  it('normalizes repository base paths for Vite', () => {
    expect(normalizeBasePath('landing-zone-next-gen')).toBe('/landing-zone-next-gen/');
    expect(normalizeBasePath('/landing-zone-next-gen/')).toBe('/landing-zone-next-gen/');
    expect(normalizeBasePath('/')).toBe('/');
  });

  it('copies index.html to 404.html for clean SPA routes on GitHub Pages', async () => {
    const distDir = await mkdtemp(path.join(tmpdir(), 'lzng-pages-'));
    await writeFile(path.join(distDir, 'index.html'), '<html>app</html>', 'utf8');

    const targetPath = await copySpaFallback({ distDir });

    expect(path.basename(targetPath)).toBe('404.html');
    await expect(readFile(path.join(distDir, '404.html'), 'utf8')).resolves.toBe('<html>app</html>');
  });
});
