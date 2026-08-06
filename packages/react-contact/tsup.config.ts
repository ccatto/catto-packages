import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { defineConfig } from 'tsup';

export default defineConfig({
  // Two entry points: the client bundle (index) and the server-only helper
  // (server). `splitting: false` keeps each entry self-contained so no shared
  // chunk can leak the "use client" directive onto server code — see onSuccess.
  entry: { index: 'src/index.ts', server: 'src/server/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [
    'react',
    'react-dom',
    'react-hook-form',
    '@hookform/resolvers',
    '@hookform/resolvers/zod',
    'zod',
    '@ccatto/profanity',
    '@ccatto/profanity/zod',
  ],
  async onSuccess() {
    // Prepend "use client" ONLY to the client entry (index.*). The server
    // entry (server.*) must stay a plain server module — it holds secrets and
    // is imported from route handlers / server actions.
    const clientFiles = await glob('dist/index.{js,cjs}');
    for (const file of clientFiles) {
      const content = readFileSync(file, 'utf-8');
      if (!content.startsWith('"use client"')) {
        writeFileSync(file, `"use client";\n${content}`);
      }
    }
    console.log('Added "use client" directive to client entry (dist/index.*)');
  },
});
