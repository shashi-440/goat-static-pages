import { Express } from "express";
import chalk from "chalk";

import config from "../config";

/**
 * Byte-for-byte the same dev middleware wiring as amber-user-website's
 * src/server/devServer: rspack compiler → webpack-dev-middleware (writeToDisk so
 * the SSR side can read loadable-stats from disk) → webpack-hot-middleware.
 */
export default (app: Express): void => {
  const { rspack } = require("@rspack/core");
  const rspackConfig = require("../../webpack/client.config").default;
  const compiler = rspack(rspackConfig);
  const instance = require("webpack-dev-middleware")(compiler, {
    headers: { "Access-Control-Allow-Origin": "*" },
    serverSideRender: true,
    writeToDisk: true,
  });

  app.use(instance);
  app.use(
    require("webpack-hot-middleware")(compiler, {
      log: false,
      path: "/__webpack_hmr",
      heartbeat: 10 * 1000,
    }),
  );

  instance.waitUntilValid(() => {
    const url = `http://${config.HOST}:${config.PORT}`;
    console.info(chalk.green(`==> 🌎  Listening at ${url}`));
  });
};
