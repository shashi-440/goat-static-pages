import path from "path";
import { rspack, RspackOptions } from "@rspack/core";
import nodeExternals from "webpack-node-externals";
import merge from "webpack-merge";

import baseConfig, { isDev } from "./base.config";

const config: RspackOptions = {
  target: "node",
  devtool: isDev ? "inline-source-map" : "source-map",
  entry: "./src/server",
  output: {
    filename: "index.js",
    chunkFilename: "[id].js",
    path: path.resolve(process.cwd(), "public/server"),
    libraryTarget: "commonjs2",
    publicPath: "/assets/",
  },
  node: { __dirname: true, __filename: true },
  externals: [
    "@loadable/component",
    nodeExternals({
      allowlist: [
        /\.(?!(?:jsx?|json)$).{1,5}$/i,
        // `cobe` and its dependency `phenomenon` are both ESM-only ("type":
        // "module"). Left external they are `require()`d at runtime, which Node
        // refuses for ESM — fine under a lenient local run, fatal on a stricter
        // host (Vercel returns `require() of ES Module ... not supported` and the
        // page 500s). Bundling them sidesteps the interop entirely.
        //
        // Both are needed: fixing only `cobe` moved the same error onto
        // `phenomenon`, which it pulls in.
        "cobe",
        "phenomenon",
      ],
    }) as any,
  ],
  plugins: [
    new rspack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
    }),
    // Same asset-copy contract as amber-user-website: co-located `assets/`
    // directories are emitted to /assets/images/... so getImagePath-style URLs
    // resolve identically. AboutUsV2's 45 assets ride on the pages/ pattern.
    new rspack.CopyRspackPlugin({
      patterns: [
        // noErrorOnMissing: unlike amber-user-website, this sandbox may legitimately
        // have no co-located assets under components/ or app/ yet. A glob that
        // matches nothing is not an error here.
        {
          from: "src/components/**/assets/*.*",
          noErrorOnMissing: true,
          to({ absoluteFilename }: any) {
            return `../assets/images/components/${absoluteFilename.split("src/components/")[1]}`;
          },
        },
        {
          from: "src/pages/**/assets/*.*",
          noErrorOnMissing: true,
          to({ absoluteFilename }: any) {
            return `../assets/images/pages/${absoluteFilename.split("src/pages/")[1]}`;
          },
        },
        {
          from: "src/app/**/assets/*.*",
          noErrorOnMissing: true,
          to({ absoluteFilename }: any) {
            return `../assets/images/app/${absoluteFilename.split("src/app/")[1]}`;
          },
        },
      ],
    }),
  ],
  optimization: { minimize: !isDev },
};

export default merge(baseConfig(false), config);
