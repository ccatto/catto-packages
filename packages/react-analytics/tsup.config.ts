import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { defineConfig } from 'tsup';

export default defineConfig({
  // Two entries:
  //  - index  → server-safe barrel (<GoogleAnalyticsCatto/> stays a server
  //             component; the client boundary lives in @next/third-parties).
  //             trackEvent/setUserProperties/getCapacitorPlatform/useAnalyticsPlatform
  //             are plain functions/hooks that work when called from client code.
  //  - platform → the <AnalyticsPlatformCatto/> client component; gets a
  //             "use client" directive (see onSuccess). Exposed at `./platform`.
  // splitting:false keeps each entry self-contained so the directive can't leak
  // onto the server-safe index.
  entry: { index: 'src/index.ts', platform: 'src/platform.tsx' },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [
    'react',
    'react-dom',
    'next',
    '@next/third-parties',
    '@next/third-parties/google',
  ],
  async onSuccess() {
    // Prepend "use client" ONLY to the platform entry — index must stay
    // server-safe so <GoogleAnalyticsCatto/> can render in a server layout.
    const clientFiles = await glob('dist/platform.{js,cjs}');
    for (const file of clientFiles) {
      const content = readFileSync(file, 'utf-8');
      if (!content.startsWith('"use client"')) {
        writeFileSync(file, `"use client";\n${content}`);
      }
    }
    console.log('Added "use client" directive to dist/platform.*');
  },
});
