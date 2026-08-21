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
          // Videos only, NOT `*.*`.
          //
          // base.config's asset rule already emits png|svg|jpe?g|gif as hashed files
          // for anything a page imports, which is every image here. Copying `*.*` as
          // well emitted a second, unhashed copy of all of them — ~16MB of duplicate
          // bytes in the build output, none of it referenced.
          //
          // mp4 is the exception the loader does not match, and two pages point at
          // one by literal URL (HowItWorksV2 Steps, GroupBookingV2Alt Hero), so those
          // still have to be copied. Lottie JSON does not: it is imported, so it ends
          // up inside the bundle.
          //
          // If a page ever needs another by-URL asset type, widen this glob to that
          // extension rather than back to `*.*`.
          from: "src/pages/**/assets/*.mp4",
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
