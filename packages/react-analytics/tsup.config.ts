import { defineConfig } from 'tsup';

export default defineConfig({
  // Single entry, server-safe barrel. Unlike @ccatto/ui / @ccatto/react-contact,
  // we DO NOT prepend a "use client" directive: <GoogleAnalyticsCatto/> must stay
  // a server component, and the client boundary already lives inside
  // @next/third-parties (its google/ga.js is the "use client" module). This
  // mirrors how @next/third-parties' own google/index.js barrel is structured.
  entry: { index: 'src/index.ts' },
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
});
