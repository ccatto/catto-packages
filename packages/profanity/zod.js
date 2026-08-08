// Root re-export shim so `@ccatto/profanity/zod` resolves under classic
// (node10 / NestJS default) moduleResolution, which does not read "exports".
// Modern resolvers (node16/bundler) use the "exports" map -> dist/zod.js.
module.exports = require('./dist/zod.js');
