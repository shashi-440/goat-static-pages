import path from "path";
import { rspack, RspackOptions } from "@rspack/core";
import ReactRefreshPlugin from "@rspack/plugin-react-refresh";
import merge from "webpack-merge";

import baseConfig, { getStaticPath, isDesktop, isDev } from "./base.config";

const suffix = isDesktop ? "desktop" : "mobile";

const getPlugins = () => {
  let plugins: any[] = [
    new rspack.CssExtractRspackPlugin({
      // No contenthash in development — renderHtml relies on stable filenames.
      filename: isDev ? `css/[name].${suffix}.css` : `css/[name].[contenthash].${suffix}.css`,
      chunkFilename: isDev ? `css/[id].${suffix}.css` : `css/[id].[contenthash].${suffix}.css`,
    }),
  ];

  if (isDev)
    plugins = [...plugins, new rspack.HotModuleReplacementPlugin(), new ReactRefreshPlugin()];

  return plugins;
};

const getEntry = () =>
  isDev ? ["webpack-hot-middleware/client?reload=true", "./src/client"] : "./src/client";

const config: RspackOptions = {
  devtool: isDev ? "eval-cheap-source-map" : "source-map",
  entry: getEntry(),
  output: {
    filename: isDev ? `js/[name].${suffix}.js` : `js/[name].[contenthash].${suffix}.js`,
    chunkFilename: isDev ? `js/[id].${suffix}.js` : `js/[id].[contenthash].${suffix}.js`,
    path: path.resolve(process.cwd(), "public/assets"),
    publicPath: getStaticPath(),
  },
  optimization: { minimize: !isDev },
  plugins: getPlugins(),
};

export default merge(baseConfig(true), config);
