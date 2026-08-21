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

// Only bind a port when this process owns one. A serverless host (Vercel and
// friends) imports the app and handles the listening itself, so calling listen()
// at module load would try to bind inside an environment that forbids it — the
// import fails and every request 500s. `VERCEL` is set by the platform.
//
// Host/port come from the platform when it provides them: PORT is the standard
// env var, and binding must be 0.0.0.0 rather than localhost or the container
// accepts no external traffic. Local dev is unchanged — LOCAL_PORT and localhost
// still apply when nothing else is set.
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT) || config.PORT;
  const host = process.env.HOST || (process.env.PORT ? "0.0.0.0" : config.HOST);

  app.listen(port, host, () => {
    console.info(chalk.green(`==> ✅  Server started on ${host}:${port}`));
    console.info(chalk.cyan(`==> 🚀  http://${host}:${port}/about-us-v2`));
  });
}

export default app;
