// Serverless entry for Vercel.
//
// The build emits a Node server bundle to public/server; this hands its Express
// app to the platform rather than listening on a port itself (src/server/index.ts
// skips listen() when VERCEL is set). Everything else — routing, SSR, static
// assets — is the same code that runs locally.
const app = require("../public/server/index.js");

module.exports = app.default || app;
