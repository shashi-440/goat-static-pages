/**
 * Local declaration for `compression`, replacing @types/compression.
 *
 * Why not the @types package: it depends on `@types/express: *`, which drags a
 * second, Express-5-era copy of @types/express-serve-static-core into the tree.
 * Two copies make `app.use(compression())` fail to match any express.use overload
 * (TS2769), and yarn 1 `resolutions` does not dedupe that nested subtree. Declaring
 * the single function we call against our own express types sidesteps it entirely.
 */
declare module "compression" {
  import { RequestHandler } from "express";

  interface CompressionOptions {
    chunkSize?: number;
    filter?: (req: any, res: any) => boolean;
    level?: number;
    memLevel?: number;
    strategy?: number;
    threshold?: number | string;
    windowBits?: number;
  }

  function compression(options?: CompressionOptions): RequestHandler;

  export = compression;
}
