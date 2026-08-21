import path from "path";
import { rspack, RspackOptions, RspackPluginInstance } from "@rspack/core";
import LoadablePlugin from "@loadable/webpack-plugin";
import { RspackManifestPlugin } from "rspack-manifest-plugin";

export const isDev = process.env.NODE_ENV === "development";

// This sandbox only ships the desktop bundle, matching how /about-us-v2 is
// registered in amber-user-website (desktop routes only). Kept as a flag so a
// mobile target can be added later without reshaping the config.
export const isDesktop = process.env.DEVICE !== "mobile";

export const getStaticPath = (): string => `/assets/`;

/**
 * Mirrors amber-user-website's getStyleLoaders. The important detail is the
 * sass-loader `additionalData` hook, which prepends `@import "src/theme/index.scss"`
 * to every stylesheet so SCSS modules can use theme variables/mixins without an
 * explicit import. src/theme emits no CSS rules of its own, so this is inert for
 * stylesheets that don't reference a variable — but it must stay, otherwise any
 * future v2 page that does use `$colors` or `@include` would fail to compile.
 */
const getStyleLoaders = (isWeb: boolean, isSass?: boolean) => {
  let loaders: any[] = [
    {
      loader: "css-loader",
      options: {
        importLoaders: isSass ? 2 : 1,
        modules: {
          auto: true,
          localIdentName: isDev ? "[path][name]__[local]" : "[name]__[local]",
          exportOnlyLocals: !isWeb,
        },
      },
    },
    { loader: "postcss-loader" },
  ];

  if (isWeb) loaders = [rspack.CssExtractRspackPlugin.loader, ...loaders];

  if (isSass) {
    const themePath = path.resolve(__dirname, `../src/theme/index.scss`);
    loaders = [
      ...loaders,
      {
        loader: "sass-loader",
        options: {
          additionalData: (...args: any[]) => {
            const loaderContext = args[1];
            const data = args[0];
            const { resourcePath } = loaderContext;
            const relativePath2 = path.relative(resourcePath, themePath).substring(3);

            if (resourcePath.includes("src/app/app.module.scss")) {
              return `
              @import "${relativePath2}";
              ${data}
          `;
            }
            return `@import "${relativePath2}";${data}`;
          },
        },
      },
    ];
  }

  return loaders;
};

const getFileName = (filePath: string): string =>
  isDesktop ? `${filePath}-desktop.json` : `${filePath}.json`;

const getPlugins = (isWeb: boolean) => [
  new RspackManifestPlugin({
    fileName: path.resolve(
      process.cwd(),
      getFileName(isWeb ? "public/webpack-assets" : "public/webpack-assets-server"),
    ),
    filter: (file: any) => file.isInitial,
  }),
  // ⚠️ The client and server builds MUST NOT write the same stats file.
  //
  // `public/loadable-stats-desktop.json` is what the SSR ChunkExtractor reads at
  // request time, so it has to hold the CLIENT stats — that is where the <script>
  // tags and (in dev) the CSS to inline come from. In dev the client compiler runs
  // in-process inside the express server (see src/server/devServer) and writes it.
  //
  // Both configs used to point here, which is harmless only because `yarn dev` runs
  // the server build once BEFORE the dev server starts. It stops being harmless the
  // moment a server build runs alongside it — e.g.
  //   rspack build --watch --config ./webpack/server.config.ts
  // which is the fast way to get SSR rebuilds without a 60s `yarn dev:build` per edit.
  // That watcher overwrote this file with the server bundle's stats, which list no CSS
  // and no client chunks: the page then rendered with zero stylesheets and no client
  // JS at all, so it looked unstyled and never hydrated. Nothing reads the server
  // build's own stats, so it gets a separate name.
  new LoadablePlugin({
    writeToDisk: true,
    filename: getFileName(isWeb ? "../loadable-stats" : "../loadable-stats-server"),
  }),
  new rspack.DefinePlugin({
    __CLIENT__: isWeb,
    __SERVER__: !isWeb,
    __DEV__: isDev,
    __DESKTOP__: JSON.stringify(isDesktop),
    __ASSETS_BASE_URL__: JSON.stringify(getStaticPath()),
    // Every env key src/config reads must be listed. The client bundle has no `process`,
    // so any key left out survives as a literal `process.env.X` and throws a ReferenceError
    // the moment the chunk evaluates — which loadable swallows into a permanent fallback.
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    "process.env.HOST": JSON.stringify(process.env.HOST),
    "process.env.LOCAL_PORT": JSON.stringify(process.env.LOCAL_PORT),
    "process.env.IMAGE_STATIC_ASSETS_URL": JSON.stringify(process.env.IMAGE_STATIC_ASSETS_URL),
    "process.env.IMAGE_ASSETS_URL": JSON.stringify(process.env.IMAGE_ASSETS_URL),
    "process.env.MAPBOX_ACCESS_TOKEN": JSON.stringify(process.env.MAPBOX_ACCESS_TOKEN),
  }),
];

const config = (isWeb = false): RspackOptions => ({
  mode: isDev ? "development" : "production",
  stats: "minimal",
  context: path.resolve(process.cwd()),
  plugins: getPlugins(isWeb) as RspackPluginInstance[],
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: { syntax: "typescript", tsx: true, decorators: false },
                transform: { react: { runtime: "automatic", refresh: isDev && isWeb } },
                target: isWeb ? "es2017" : "es2019",
              },
            },
          },
          {
            // babel-loader runs first (loaders execute bottom-to-top). Only the
            // @loadable/babel-plugin matters — it injects __webpack_chunkName magic
            // comments into dynamic imports so @loadable/component works under SSR.
            loader: "babel-loader",
            options: {
              babelrc: false,
              configFile: false,
              plugins: ["@loadable/babel-plugin"],
              presets: [
                "@babel/preset-typescript",
                ["@babel/preset-react", { runtime: "automatic" }],
              ],
            },
          },
        ],
      },
      { test: /\.css$/, use: getStyleLoaders(isWeb), type: "javascript/auto" },
      { test: /\.(scss|sass)$/, use: getStyleLoaders(isWeb, true), type: "javascript/auto" },
      { test: /\.(woff2?|eot|ttf|otf)$/i, type: "asset", generator: { emit: isWeb } },
      { test: /\.(png|svg|jpe?g|gif)$/i, type: "asset", generator: { emit: isWeb } },
    ],
  },
  resolve: {
    modules: ["src", "node_modules"],
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      "react/jsx-runtime": require.resolve("react/jsx-runtime.js"),
      "@Components": path.resolve(__dirname, "../src/components"),
      "@Pages": path.resolve(__dirname, "../src/pages"),
      "@App": path.resolve(__dirname, "../src/app"),
      "@Utils": path.resolve(__dirname, "../src/utils"),
      "@Theme": path.resolve(__dirname, "../src/theme"),
      "@Config": path.resolve(__dirname, "../src/config"),
      "@Icons": path.resolve(__dirname, "../src/icons"),
    },
  },
});

export default config;
