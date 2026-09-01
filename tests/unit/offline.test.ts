import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import rulesData from '../../src/data/rules.json';

const SRC_DIR = join(process.cwd(), 'src');

const collectSourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      return collectSourceFiles(fullPath);
    }
    return /\.(ts|tsx)$/.test(entry) ? [fullPath] : [];
  });

describe('Client-side only architecture (FR-008, FR-011, SC-004, Constitution II)', () => {
  const sourceFiles = collectSourceFiles(SRC_DIR);

  it('bundles rules.json as a module import rather than fetching it', () => {
    expect(Array.isArray(rulesData.tools)).toBe(true);
    expect(rulesData.tools.length).toBe(5);
  });

  it('contains no network calls anywhere in src/', () => {
    const offenders = sourceFiles.filter((file) => {
      const contents = readFileSync(file, 'utf8');
      return /\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|new\s+WebSocket|new\s+EventSource/.test(
        contents
      );
    });

    expect(offenders).toEqual([]);
  });

  it('contains no browser storage writes in src/', () => {
    const offenders = sourceFiles.filter((file) => {
      const contents = readFileSync(file, 'utf8');
      return /localStorage|sessionStorage|document\.cookie|indexedDB/.test(contents);
    });

    expect(offenders).toEqual([]);
  });
});
