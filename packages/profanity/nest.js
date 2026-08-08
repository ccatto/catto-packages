// Root re-export shim so `@ccatto/profanity/nest` resolves under classic
// (node10 / NestJS default) moduleResolution, which does not read "exports".
// Modern resolvers (node16/bundler) use the "exports" map -> dist/nest.js.
module.exports = require('./dist/nest.js');
