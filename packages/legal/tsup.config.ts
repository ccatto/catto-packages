import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { defineConfig } from 'tsup';

export default defineConfig({
  // Two entries:
  //  - index  -> the pure core + server guard. NO React, NO I/O, NO "use client"
  //             directive, so it's safe to import in a NestJS backend.
  //  - react  -> the headless hook + presentational gate. Gets "use client"
  //             (see onSuccess) and is the ONLY entry that touches React.
  // splitting:false keeps each entry self-contained so React can't leak into the
  // core bundle and the directive can't leak onto it.
  entry: { index: 'src/index.ts', react: 'src/react/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom'],
  async onSuccess() {
    // Prepend "use client" ONLY to the react entry. The core (index.*) stays a
    // plain, React-free module.
    const clientFiles = await glob('dist/react.{js,cjs}');
    for (const file of clientFiles) {
      const content = readFileSync(file, 'utf-8');
      if (!content.startsWith('"use client"')) {
        writeFileSync(file, `"use client";\n${content}`);
      }
    }
    console.log('Added "use client" directive to dist/react.*');
  },
});
