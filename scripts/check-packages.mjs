#!/usr/bin/env node
// Validate every publishable package's publishing setup:
//   - publint: exports map / files / format sanity (uses `npm pack`; Yarn 1's
//     `yarn pack` misreports files, so we force npm).
//   - @arethetypeswrong/cli (attw): types resolve across node10 / node16 / bundler.
// Run after `yarn build`. Exits non-zero if any package fails. Kept green via the
// small, DOCUMENTED ignore config below — each exception is intentional.
//
// Usage: node scripts/check-packages.mjs   (or `yarn check:packages`)

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bin = (name) => join(root, 'node_modules', '.bin', name);

// --- attw ignore config (every entry is a deliberate, reviewed exception) ---

// `false-esm` ("Masquerading as ESM"): our tsup dual ESM/CJS packages point the
// `require` condition's types at the ESM `.d.ts`. Harmless for how these packages
// are actually consumed (bundler + ESM resolution are both green); only a pure
// CJS + node16 *type* consumer sees it. Fixing it properly means splitting
// `require.types` to the `.d.cts` (which tsup already emits) across ~11 packages
// and republishing them — tracked in BACKLOG.md. Ignored repo-wide until then.
const GLOBAL_ATTW_IGNORE = ['false-esm'];

// `no-resolution` under node10 (classic) for a package's SUBPATH exports — node10
// doesn't read "exports". Only kept for subpaths whose consumers use a modern
// resolver (Next.js/bundler), where they're green. NOTE: @ccatto/profanity is
// deliberately NOT here — it ships root re-export shims so its subpaths resolve
// under classic resolution too (NestJS), and stays strict.
const ATTW_IGNORE_PER_PKG = {
  '@ccatto/ui': ['no-resolution'], // ./themes/*.css entrypoints aren't JS modules
  '@ccatto/imagekit': ['no-resolution'], // ./server — bundler-consumed
  '@ccatto/react-contact': ['no-resolution'], // ./server — bundler-consumed
  '@ccatto/react-analytics': ['no-resolution'], // ./platform — bundler-consumed
  '@ccatto/react-auth': ['no-resolution'], // ./server — bundler-consumed
};

// --- run ---

const pkgsDir = join(root, 'packages');
const dirs = readdirSync(pkgsDir).filter((d) =>
  existsSync(join(pkgsDir, d, 'package.json')),
);

const failures = [];

for (const d of dirs) {
  const dir = join(pkgsDir, d);
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  if (pkg.private) {
    console.log(`⊘  ${pkg.name} (private, skipped)`);
    continue;
  }

  const run = (binName, args) => {
    try {
      execFileSync(bin(binName), args, { cwd: dir, encoding: 'utf8' });
      return { ok: true, out: '' };
    } catch (err) {
      return {
        ok: false,
        out: `${err.stdout ?? ''}${err.stderr ?? ''}`.trim(),
      };
    }
  };

  const publint = run('publint', ['--pack', 'npm']);

  const ignore = [
    ...GLOBAL_ATTW_IGNORE,
    ...(ATTW_IGNORE_PER_PKG[pkg.name] ?? []),
  ];
  const attwArgs = ['--pack', '.', '--format', 'table-flipped'];
  if (ignore.length) attwArgs.push('--ignore-rules', ...ignore);
  const attw = run('attw', attwArgs);

  if (publint.ok && attw.ok) {
    console.log(`✓  ${pkg.name}`);
  } else {
    console.log(`✗  ${pkg.name}`);
    failures.push({ name: pkg.name, publint, attw });
  }
}

if (failures.length) {
  console.error(`\n${failures.length} package(s) failed export validation:\n`);
  for (const f of failures) {
    console.error(`── ${f.name} ─────────────────────────────`);
    if (!f.publint.ok) console.error(`[publint]\n${f.publint.out}\n`);
    if (!f.attw.ok) console.error(`[attw]\n${f.attw.out}\n`);
  }
  process.exit(1);
}

console.log(`\nAll ${dirs.length} packages passed export validation.`);
