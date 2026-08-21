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

// `reload=true` is deliberately NOT set.
//
// With it, any HMR update the runtime cannot apply becomes a full page reload.
// `lottie-web` is pulled in by a dynamic `import()` inside LottieIcon, and the
// hot runtime reports it back with an undefined module id — an update it can
// never apply — so every sync forced a reload and the page refreshed in a loop.
//
// `noEmitOnErrors` keeps the older behaviour of not tearing the page down on a
// failed build; without `reload` a stale module simply stays until the next
// successful hot update or a manual refresh.
const getEntry = () =>
  isDev
    ? ["webpack-hot-middleware/client?noEmitOnErrors=true", "./src/client"]
    : "./src/client";

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
