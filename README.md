# amber-v2-pages

Standalone SSR sandbox for v2 static page designs, mirroring the
[amber-user-website](https://github.com/amberhq/amber-user-website) build pipeline so pages move
between the two repos without edits.

First page ported: **About Us v2** → http://localhost:3005/about-us-v2
(source: `origin/about-us-page-revamp`, commit `c4485d5ba`).

## Running

```bash
nvm use 20.19.0     # .nvmrc; rslog needs ^20.19.0, same as the main app
yarn install
yarn dev            # http://localhost:3005
```

`yarn dev` builds the server bundle then runs it under nodemon, with
webpack-dev-middleware + HMR serving the client bundle — the same two-step as the main app's
`yarn dev-desktop`. `yarn build` produces the production server + client bundles; `yarn start`
serves them. `yarn lint:type` runs `tsc --noEmit` and is currently clean.

## Why the pipeline is a copy, not a simplification

The whole point is that a page can be developed here and pasted back into amber-user-website
unchanged. That requires the same compilation semantics, so these are deliberately identical:

| Piece | Detail |
|---|---|
| Bundler | rspack, `builtin:swc-loader` + `babel-loader` running only `@loadable/babel-plugin` |
| Code splitting | `@loadable/component` + `LoadablePlugin`, stats file read by the SSR `ChunkExtractor` |
| SCSS | `sass-loader` `additionalData` auto-prepends `@import "src/theme/index.scss"` to every stylesheet |
| CSS modules | `localIdentName: "[path][name]__[local]"` in dev — class names match the main app exactly |
| Autoprefixer | `browserslist: ["> 1%", "last 2 versions"]` — **must match**, or `-webkit-` prefixes silently drop |
| Path aliases | `@Components/* @Pages/* @App/* @Utils/* @Theme/* @Config/* @Icons/*` |
| Assets | `CopyRspackPlugin` emits co-located `**/assets/*` to `/assets/images/{pages,components,app}/…` |
| Globals | `__CLIENT__ __SERVER__ __DEV__ __DESKTOP__ __ASSETS_BASE_URL__` |
| Global CSS | `normalize.css` + `app/app.module.scss` (the 236-line reset) + `app/global.scss` |

Desktop-only, matching how `/about-us-v2` is registered upstream (`src/routes/desktop/index.ts`).

## What was copied byte-identical

Verified with `diff` against the source repo:

- `src/pages/AboutUsV2/**` — all 68 files (page, 10 components, 46 assets)
- `src/components/Image/`, `src/components/CustomLink/`
- `src/hooks/useLazyImage.ts`, `src/hooks/useLazyCallback.tsx`
- `src/utils/clientUtils/stringUtility/formatClassNames.ts`
- `src/components/Footer/util.ts` (`getSiteNavSchema`)
- `src/theme/**`, `src/app/app.module.scss`, `src/app/global.scss`
- Footer stylesheets (`Footer.module.scss` ← `FooterDesktop.module.scss`, plus AppDownload /
  FollowUs / ContactCard / TrustPilot modules)

To keep those byte-identical, the app-shell dependencies they import are provided at the **same
import paths** as stubs:

| Path | Upstream behaviour | Here |
|---|---|---|
| `@Utils/wrapperHOC` | China/whitelabel/app gating + ErrorBoundary | ErrorBoundary only (one variant is built) |
| `hooks/useIsRedirect` | `isDesktop && isInternalUser` from Redux | `false` — what every ordinary visitor gets |
| `hooks/useLanguagePath` | prefixes `/es` `/de` `/fr` from Redux | identity (single-locale) |
| `@Utils/webviewEvents` | native webview postMessage bridge | no-op |
| `@Config/index` | ~80 keys | the 5 the ported code reads |
| `@Components/FooterV2/FooterDesktop` | the real footer | re-exports the static `Footer` |

## Verified parity against the live page

Compared SSR output of `localhost:3005/about-us-v2` against amber-user-website's
`localhost:3002/about-us-v2`:

- **Visible copy** — identical
- **CSS class multiset** — identical
- **Compiled page CSS** — 125 rule blocks both sides, 0 missing, 0 differing
- **Tag multiset** — identical except 3 `<div>`s that are the host app's portal/wrapper slots
  (`<div id="forPortal">` etc.), not page content
- **All 46 page assets** resolve 200

## The footer is the one deliberate divergence

Upstream `FooterDesktop` transitively pulls **281 files** — the Redux store, every page reducer,
Tolgee, PostHog, GrowthBook, axios services. Porting that would mean porting the app.

`src/components/Footer/` is instead a structured static rebuild: identical DOM, identical class
names (stylesheet is a byte copy), identical per-link JSON-LD hoisted to end-of-body via
`HelmetServer`. Content lives in **`footerContent.json`** — captured from the live rendered
footer, so labels and URLs are the real resolved values. **Edit that file, not `Footer.tsx`.**

What differs, deliberately:

- Copy is English from JSON, not live Tolgee `t()`
- Phone number is the UK default; upstream picks it from the Redux `country` code
- No China variant, no gtag click events, no CSP nonce
- No sub-LG swap to the mobile `FooterV2`
- Social icons are real `<a>` tags (upstream routes clicks through the native app bridge)
- Contact cards render server-side here; upstream populates them in a `useEffect`, so they are
  absent from its SSR HTML
- Schema `name` values are the English labels. Upstream passes the **untranslated Tolgee key**
  (`home.footer.suboptions.about`) into its JSON-LD — an upstream bug not worth reproducing

Trustpilot is a real embed, so the live rating still renders.

## Adding the next v2 page

1. Drop it in `src/pages/<Name>/` — keep the upstream folder shape so it can go back unchanged.
2. Add a `loadable` import and a route entry in `src/routes/index.tsx`.
3. Add a row to `PAGES` in `src/pages/Index/index.tsx` so it shows on the directory at `/`.

If the page reaches for an app-shell dependency that isn't here yet, add a stub at the **same
import path** rather than editing the page — that is what preserves the paste-back property.
