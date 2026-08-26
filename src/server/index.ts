import path from "path";
import express from "express";
import compression from "compression";
import chalk from "chalk";

import config from "../config";
import ssr from "./ssr";

const app = express();
const isDev = process.env.NODE_ENV === "development";

app.use(compression());

// Static assets. In dev, webpack-dev-middleware serves /assets from memory (and
// mirrors to disk); this express.static call additionally covers the files the
// server build's CopyRspackPlugin emits — i.e. every co-located
// src/pages/**/assets/* image, including AboutUsV2's 45 files.
app.use("/assets", express.static(path.resolve(process.cwd(), "public/assets")));
app.use(express.static(path.resolve(process.cwd(), "public"), { index: false }));

if (isDev) {
  // eslint-disable-next-line global-require
  require("./devServer").default(app);
}

app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});

app.get("*", (req, res) => {
  void ssr(req, res);
});

// Always bind. This process is only ever run directly — by `yarn dev`, and by
// scripts/prerender.mjs, which spawns it and crawls it to write the static HTML.
//
// This used to be wrapped in `if (!process.env.VERCEL)`, for a deployment that
// imported the app into a serverless function and did its own listening. That
// function is gone: the site is prerendered at build time and served as static
// files. The guard then became actively harmful, because Vercel sets VERCEL=1
// during BUILDS as well — so the prerender's server would start, skip listen(),
// and exit 0 without serving, failing the build with "Server exited with code 0
// before serving anything."
//
// Host/port come from the platform when it provides them: PORT is the standard
// env var, and binding must be 0.0.0.0 rather than localhost or a container
// accepts no external traffic. Local dev is unchanged — LOCAL_PORT and localhost
// still apply when nothing else is set.
const port = Number(process.env.PORT) || config.PORT;
const host = process.env.HOST || (process.env.PORT ? "0.0.0.0" : config.HOST);

app.listen(port, host, () => {
  console.info(chalk.green(`==> ✅  Server started on ${host}:${port}`));
  console.info(chalk.cyan(`==> 🚀  http://${host}:${port}/about-us-v2`));
});

export default app;
