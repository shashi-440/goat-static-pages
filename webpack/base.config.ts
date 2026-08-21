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

/**
 * The client and server builds each emit their own manifests, so the two must not
 * share a filename. They used to: both wrote `loadable-stats-desktop.json`, and
 * because `yarn dev` runs the server build last, the server's copy — which lists
 * no CSS, since that bundle only renders HTML — overwrote the client's. SSR then
 * looked up the page's stylesheets, found none, and served every page unstyled.
 *
 * Only the client manifest describes anything SSR needs, so it keeps the original
 * name that `src/server/ssr.tsx` reads. The server build's copy is suffixed and
 * written purely as a build artefact; nothing loads it.
 */
const getPlugins = (isWeb: boolean) => [
  new RspackManifestPlugin({
    fileName: path.resolve(
      process.cwd(),
      getFileName(isWeb ? "public/webpack-assets" : "public/webpack-assets-ssr"),
    ),
    filter: (file: any) => file.isInitial,
  }),
  new LoadablePlugin({
    writeToDisk: true,
    filename: getFileName(isWeb ? "../loadable-stats" : "../loadable-stats-ssr"),
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
