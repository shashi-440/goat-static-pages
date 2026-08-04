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

app.listen(config.PORT, config.HOST, () => {
  console.info(chalk.green(`==> ✅  Server started on ${config.HOST}:${config.PORT}`));
  console.info(chalk.cyan(`==> 🚀  http://${config.HOST}:${config.PORT}/about-us-v2`));
});

export default app;
