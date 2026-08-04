// Ensure the compiled React component starts with the `"use client"` directive
// as its FIRST line (tsc emits `"use strict"` first, which hides it from Next's
// RSC boundary detection). Runs after `tsc` in the build.
import { readFileSync, writeFileSync } from 'fs';

// Client components whose "use client" directive must be the FIRST line (tsc
// emits "use strict" first, which hides it from Next's RSC boundary detection).
const files = ['dist/ImageUploadCatto.js', 'dist/ImageGalleryCatto.js'];

for (const file of files) {
  let src = readFileSync(file, 'utf8');
  // Drop any existing use-client directive line (tsc placed it after use strict).
  src = src.replace(/^\s*['"]use client['"];?\s*\n/gm, '');
  writeFileSync(file, `"use client";\n${src}`);
  console.log(`imagekit: marked ${file.replace('dist/', '')} as "use client"`);
}
