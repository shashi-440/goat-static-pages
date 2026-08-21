/**
 * Trimmed mirror of amber-user-website's src/config/index.ts.
 *
 * Only the keys the ported v2 page and its components actually read are kept:
 *   - IMAGE_STATIC_ASSETS_COMPONENTS_PATH / IMAGE_STATIC_URL → Navbar logos
 *   - IS_CHINA_APP / CHINA_STATIC_ASSETS_URL → read by the verbatim Image component
 *
 * IS_CHINA_APP is hardcoded false: this sandbox is global-only, which makes the
 * China rewrite branch in Image dead code. Kept rather than deleted so the
 * component stays byte-identical to the one in amber-user-website.
 */

const IMAGE_STATIC_URL =
  process.env.IMAGE_STATIC_ASSETS_URL || "https://static-assets.amberstudent.com";

const config = {
  HOST: process.env.HOST || "localhost",
  PORT: Number(process.env.LOCAL_PORT) || 3005,

  isProduction: process.env.NODE_ENV === "production",

  IMAGE_STATIC_URL,
  IMAGE_ASSETS_URL: process.env.IMAGE_ASSETS_URL || "https://assets.amberstudent.com",

  /**
   * Served locally, not from the CDN. Upstream this is `${IMAGE_STATIC_URL}/images/components`,
   * but no CDN host actually serves that tree — `/images/components/Header/assets/
   * amber-logo-dark.svg` 404s on static-assets, prod-static-assets and assets alike. The real
   * source of those files is each component's co-located `assets/` dir, which CopyRspackPlugin
   * emits to `/assets/images/components/…` (see webpack/server.config.ts). Pointing at the
   * build output is what makes the Navbar logo resolve.
   *
   * Only Navbar's `logoDark` reads this, and config is sandbox-local — a page pasted back into
   * amber-user-website picks up that repo's config, so this cannot leak upstream.
   */
  IMAGE_STATIC_ASSETS_COMPONENTS_PATH: "/assets/images/components",

  /**
   * Mapbox GL JS access token.
   *
   * Same key name and the same env-first shape as amber-user-website's config, so the globe
   * component can be pasted back unchanged.
   *
   * ⚠️ NO FALLBACK VALUE, deliberately. This held amber's non-production token inline and this
   * repo is PUBLIC — a `pk.` token is public by design and already ships in amber-user-website's
   * client bundle, but a token sitting in a public repo is a token that gets scraped, and the
   * usage it runs up is billed to amber. Supply it locally instead:
   *
   *   echo 'MAPBOX_ACCESS_TOKEN=pk...' > .env      # gitignored
   *
   * The build scripts read that file (`--env-file-if-exists=.env`, so a missing file is not an
   * error) and DefinePlugin inlines whatever it finds — see `webpack/base.config.ts`. With no
   * token the globe degrades to its fallback photograph rather than failing; see `DemandGlobe`.
   *
   * Mapbox is NOT an npm dependency in either repo: the main app injects mapbox-gl from
   * api.mapbox.com at runtime and declares `mapboxgl` as an ambient global, and this sandbox
   * mirrors that. api.mapbox.com is already in the main app's CSP script-src.
   */
  MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN || "",

  IS_CHINA_APP: false,
  CHINA_STATIC_ASSETS_URL: "",
};

export default config;
