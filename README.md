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

## Career page (`/career-v2`)

Built in this sandbox from the
[Career Page Cleanup – Jan 26](https://www.figma.com/design/wE2CP3VpewPPXh5uNDBn3g/Career-Page-Cleanup-%E2%80%93-Jan-26?node-id=2665-13542)
Figma frame (`2665:13542`), via the Figma MCP `get_design_context` — so copy, hex
values, and spacing are the designer's, not eyeballed from a screenshot.

Section heights match the Figma frames measured in a headless browser:

| Section | Rendered | Figma |
|---|---|---|
| Hero | 1071 | 1080 |
| Mission + stats | 706 | 704.82 |
| Benefits | 893 | 893.39 |
| Core Values | 466 | 466 |
| Team + CTA | 1260 | 1258 |
| Footer | 468 | 468 |

**The hero deliberately diverges from the Figma frame.** Figma draws it as a
static contained 1352x760.68 image; here it reuses AboutUsV2's hero treatment
instead — full-bleed (100vw) on load, easing to a contained
`min(1280px, 100vw - 160px)` box with 24px corners over the first 420px of
scroll, plus a 350ms-delayed fade-in. Verified identical to `/about-us-v2` at
every scroll offset (0/105/210/315/420/600 → 1512/1454/1396/1338/1280/1280px,
radius 0→24px). Change `SHRINK_DISTANCE` in `Hero.tsx` to retune the scroll
distance.

`hero.jpg` is 2400x1350 (16:9) to stay sharp at full-bleed — JPEG, since the
2000px PNG was 2.9MB against 428KB for more pixels.

### The founder portrait puts sunglasses on when hovered

Ported from the `avatar-hover` snippet (`~/Design QA/avatar-hover/SNIPPET.html`).
Two stacked layers in one round frame: the portrait is a background image on
`.avatar` and the shades are an absolutely-positioned `.shades` child. On hover
the shades fade in while travelling from `-14%` above the face and unwinding a
`-7deg` cant, pivoting at `56% 40%` (the bridge of the nose). Pure CSS, no JS.

**The face art must be the shades-less portrait.** The original `founder.png` had
sunglasses baked in, so it could never animate — `founder-plain.png` (the same
photo without them) replaced it, with `founder-shades.png` as the moving layer.
Only the shades are ever transformed: the two are separate images, so animating
the face would visibly shift it against them.

Both layers are registered on the same square grid, so `background-size: 100%
100%` lines them up at any size and the 90px avatar needed no nudging. If the
portrait is ever swapped, adjust `--av-shade-x` / `--av-shade-y` rather than
editing the artwork.

### The founder quote reads along with the scroll

`components/ScrollText/` splits a passage into per-word spans and drives a
`--lit` custom property (0 → 1) from the block's position in the viewport, so
each word eases from `$neutral3` to `$neutral8` as you scroll — the passage
appears to be read by the scroll rather than simply fading in. `color-mix()`
does the interpolation, with an `@supports` opacity fallback.

Two things that are easy to get wrong here, both verified:

- **The tail must finish on screen.** Word starts are spread over `0 → 1 - fade`
  (not `0 → 1`) so the *last* word completes exactly at progress 1. Without that
  the closing words never reach full colour. The ramp runs y=300→1000 at a
  900px viewport, completing while the quote's top is still at 105px.
- **SSR renders it fully lit.** Initial state is `progress = 2`, not 1 — a word's
  ramp is `fade` wide and the last starts at `1 - fade`, so 1 leaves the tail
  part-lit in the server HTML (and with JS disabled). Confirmed: every
  server-rendered word carries `--lit:1`.

Mission also has `padding-top: 96px` so the quote is not flush against the hero
image.

### The team cards reuse AboutUsV2's flip

`components/Team/` deliberately mirrors two AboutUsV2 components rather than
inventing its own interaction:

- **Flip + toggle** from `WhyAmberExists` — a real `rotateX(180deg)` on a
  `preserve-3d` inner, with `perspective` on the parent and a separate `.tilt`
  layer so the cursor-following hover tilt (±12deg, driven by pointer height)
  never fights the 0.7s flip timing. The `+` / `x` are the same CSS-drawn bars on
  a 40px `#222` circle, greying on hover.
- **Carousel** from `AmberStory` — `PER_VIEW` cards in view, sliding exactly one
  card per click via `translateX(calc(-i * (100% + gap) / per-view))`, with
  arrows that `disable` at the ends instead of wrapping.

The flipped face follows Figma 2675:16173: white card, `$neutral7` 24px quote,
pink signature, dark round close bottom-right.

Card art notes: card 1's portrait is the straight-on shot from the Figma
(`2675:16154`, raw image 4 of 6 — the composed node export is only 411px, so pull
the raw). Portraits and the signature are JPEG/trimmed PNG — the section's assets
went 8.0MB → 3.0MB with no change at display size.

**Seven of the ten roster entries are placeholders.** Figma supplies only three
portraits (Harshal, David, Bhanu), so the rest reuse those photos in rotation and
their names, roles and quotes are written copy, not supplied content — the same
faces visibly repeat as you scroll. Replace the `photo` and text per entry in
`MEMBERS` as each real profile lands; nothing else needs touching. Ten entries at
`PER_VIEW: 3` gives 8 carousel positions (7 clicks end to end).

**`.face` needs `clip-path`, not just `overflow: hidden`.** Inside a
`preserve-3d` ancestor, browsers do not reliably clip children to a rounded
parent — the photo's square corners and the name-plate scrim leaked past the
bottom radius, so the card read as rounded on top and square on the bottom.
`clip-path: inset(0 round 24px)` in the same geometry is honoured in a 3D context
and holds all four corners. Keep both properties: `overflow` covers the non-3D
case, `clip-path` the transformed one.

**`.viewport` must clip on x only.** The carousel needs a horizontal clip, but
plain `overflow: hidden` clips vertically too — and the hover tilt rotates a card
in 3D so its near edge swings *outside* its own box, which then got sliced off
flat. `overflow-x: clip` + `overflow-y: visible` keeps the horizontal clip without
scrolling, and `padding: 40px 0` / `margin: -40px 0` gives the tilt room to lean
into while leaving the section's measured height unchanged (838px).

**The flags stay round.** If they are ever wanted square, note that the Figma
exports are circular flag artwork on an *opaque white* square — un-rounding the
CSS alone leaves four white corners, and `object-fit`/scaling crops the flag's own
edge. It needs the export cropped to the circle's inscribed square instead.

One gotcha when testing: the navbar is `position: fixed`, so a card scrolled near
the top of the viewport has its first line of quote text covered. That is the
navbar overlapping, not the text being clipped — check `getBoundingClientRect().top >= 64`
before concluding the copy is cut off.

### Core Values: staggered reveal + one-shot Lottie icons

`components/LottieIcon/` plays the four JSON animations in `assets/lottie/`
(globe, rocket, graduation, search) at a 32px box in `$neutral7` (#374151).

**Interaction:** on scroll-in the cards reveal **one by one** (160ms apart), each
firing its icon animation once as it appears; the animations then **hold their
final frame**. Hovering an individual card replays **only that card's** icon
(`onMouseEnter` sits on the card, not the section). The stagger is timed in
`CoreValues.tsx` (a `revealed` counter) rather than in CSS, because each card's
entrance and its icon's one-shot play have to fire on the same tick.

Two traps when testing the per-card hover, both of which produced false failures:

- `[class*="CoreValues-module__card"]` also matches `cardTitle` and `cardBody`,
  so `nth(1)` grabs card 1's *title*, not card 2. Select the grid's direct
  children instead.
- Let animations settle **>2.1s** between hovers — rocket is the longest, and a
  still-running rocket reads as a second icon "leaking" on an unrelated hover.

- **Recoloured on import, not at runtime.** The source files shipped with black
  strokes plus stray red accents; a script rewrote every `c.k` colour value
  (static and keyframed) to #374151. All four report only `rgb(55,65,81)`.
- **`lottie-web` is imported dynamically inside the effect**, so it never runs
  during SSR (it touches `document` on load) and never enters the server bundle.
  The card titles and body copy still server-render for SEO — only the glyph is
  client-side.
- **`LottieIcon` is NOT wrapped in `wrapperHOC`**, unlike its siblings. The HOC
  does not forward refs, and `CoreValues` needs the ref to call `replay()` on
  hover — wrapping it silently breaks the hover. `CoreValues` itself is wrapped,
  so ErrorBoundary coverage is unchanged.
- Icons render their **last** frame on load (not frame 0), so nothing is missing
  before the intro fires — and that is also the permanent state under
  `prefers-reduced-motion`, which skips the stagger and shows all four at once.

`search.json` needed only recolouring: it shipped at 512/60fps/1.5s with 6.0%
strokes and no layer building from zero — already the family spec, unlike the
bulb it replaced.
**Checklist when adding another icon to this set.** A "Stay Curious" light-bulb
JSON was tried first and had to be dropped — it came from a different source and
read as an outsider even after correction. What to check against
globe/rocket/graduation:

| | family | the bulb that failed |
|---|---|---|
| Canvas | 512 | 1000 |
| Frame rate | 60 | 29.97 |
| Duration | 1.5s (rocket 2.1s) | 2.0s |
| Stroke as % of canvas | 6.0–6.7% | 2.1% / 0.53% |
| Ink fill of canvas | ~90% | 68% |
| Any layer scaling from 0 at t=0 | none | yes |

Stroke weight matters most: line thickness has to be a *ratio* of the canvas, so
at 2.1% on a 1000px canvas that icon was ~3x thinner than a 32/512 one and looked
visibly flimsy beside them. The last row is the subtle one — a layer scaling from
`[0,0,100]` at t=0 means the glyph dissolves and rebuilds each cycle, which no
other icon in the set does.

Two gotchas if you do fix a file rather than replace it: retime by scaling every
keyframe `t` (not just `fr`) so the motion keeps its shape, and sample coverage
across a whole loop — a single screenshot lands on an arbitrary frame and
under-reads badly.

### The closing CTA is AboutUsV2's CrewCTA

`components/CrewCTA/` mirrors `AboutUsV2/components/CrewCTA` outright — the same
five crew photos (copied from that page's assets), the same centre-outward fan
reveal (centre scales up from 0.4 first, then ±1 at 160ms, then ±2 at 300ms, fired
once by an IntersectionObserver at 0.4 threshold), the same 84/90/123px avatar
sizes with negative margins, and `#0a0a0a` background. Verified identical to
`/about-us-v2` in both the pre-reveal and settled states.

**The centre avatar has no pink ring**, deliberately: Figma 2665:13704 draws a 4px
`$primary4` ring, but AboutUsV2 removed it and matching that page was the explicit
call. Re-add the ring on `.avatarCenter` if that decision is revisited.

The button uses `RolesButton variant="solid"` — pure white with `16px 24px`
padding, matching AboutUsV2's, as opposed to the `light` `#f0f0f0` variant the
Benefits band uses.

**The Team → CrewCTA gradient is one continuous fade.** Team's last stop and
CrewCTA's first stop are both `#0a0a0a`, and CrewCTA then descends to `#000`.
This matters: Team originally ended at `#000` against CrewCTA's flat `#0a0a0a`,
so the page got *lighter* across the boundary (sampled rgb 3 → rgb 10) and that
reversal read as a hard line. Post-fix the strip descends monotonically
(13→12→11→10→9) with a largest lightening step of +1. If you retune either
section's background, keep the handoff value equal.

Two things worth knowing before editing:

- **Flags are PNGs, not SVGs.** Figma exports `flags/circle/*` as one file per
  layer, so a single SVG export is only the base circle. `flag-india.png` /
  `flag-uk.png` are flattened node exports.
- **Interactive beyond the static comp.** Figma shows one frame, so the four
  non-illustrated Benefits slides and two extra testimonials are written copy in
  `Benefits.tsx` / `Team.tsx` — replace them when the designer supplies final text.
  Slide art beyond the first benefit still needs exporting.

Adding a new route needs a **dev-server restart** — the route table is compiled
into the server bundle, so HMR alone will 404 a brand-new page.

## Adding the next v2 page

1. Drop it in `src/pages/<Name>/` — keep the upstream folder shape so it can go back unchanged.
2. Add a `loadable` import and a route entry in `src/routes/index.tsx`.
3. Add a row to `PAGES` in `src/pages/Index/index.tsx` so it shows on the directory at `/`.

If the page reaches for an app-shell dependency that isn't here yet, add a stub at the **same
import path** rather than editing the page — that is what preserves the paste-back property.
