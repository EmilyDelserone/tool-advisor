import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// NFR-002: production bundle must stay under 200KB gzipped
const LIMIT_BYTES = 200 * 1024;
const assetsDir = join(process.cwd(), 'dist', 'assets');

const total = readdirSync(assetsDir)
  .filter((file) => /\.(js|css)$/.test(file))
  .reduce((sum, file) => sum + gzipSync(readFileSync(join(assetsDir, file))).length, 0);

const kb = (bytes) => `${(bytes / 1024).toFixed(2)}KB`;

if (total > LIMIT_BYTES) {
  console.error(`Bundle too large: ${kb(total)} gzipped (limit ${kb(LIMIT_BYTES)})`);
  process.exit(1);
}

console.log(`Bundle size OK: ${kb(total)} gzipped (limit ${kb(LIMIT_BYTES)})`);
