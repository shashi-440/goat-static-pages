import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import config from "@Config/index";
import styles from "./DemandGlobe.module.scss";
import { ORIGINS, PARTNERS, PROPERTIES, ROUTES, TOTALS } from "../DemandMap/network";
import { ARC_MS, FLY, STILL_PHASE, clamp01, originGlow, phaseAt } from "../DemandMap/schedule";
import { greatCircle, isFacing, LngLat, slicePath } from "./globeGeo";
import fallbackPhoto from "../../assets/hero-bg.jpg";
/**
 * The destination pin's glyph — the office-building icon, as a FILE.
 *
 * Not hand-drawn with canvas paths. A bed silhouette briefly stood here, redrawn from Maki's
 * `lodging` because Standard publishes no sprite icons by name (see `destPinSpec`), and a
 * redrawn glyph is a maintenance trap: it cannot be swapped by anyone who is not editing
 * canvas coordinates, and it drifts from whatever the icon set does next. This is the same
 * asset the rest of the page draws from.
 *
 * ⚠️  It is a SOLID BLACK glyph in the file and has to end up white inside a blue pin — see
 * `whiteMask` for why that needs a composite pass rather than a fill.
 */
import buildingOffice from "../../assets/icons/building-office.svg";

/**
 * Hero — amber's demand network on a Mapbox 3D globe.
 *
 * Same story as the flat map it replaced (WORLD → CONNECTIONS → DESTINATIONS) on a
 * real sphere: origin dots across the source countries, animated great-circle arcs,
 * and heavier destination nodes that pulse as demand lands.
 *
 * ── Mapbox is loaded from the CDN, not bundled ──────────────────────────────
 * amber-user-website already uses Mapbox GL JS on its search pages and does it by
 * injecting the script from api.mapbox.com and declaring `mapboxgl` as an ambient
 * global — no npm dependency, and api.mapbox.com is already in that app's CSP
 * script-src. This mirrors that exactly, including the `MAPBOX_ACCESS_TOKEN` config
 * key, so the component pastes back unchanged. Nothing new enters either
 * package.json.
 *
 * ── What a sphere costs, and what is done about it ──────────────────────────
 * A globe hides half of itself. That is the reason the earlier COBE globe read as
 * conveying nothing, and Mapbox does not change the geometry — it just draws a much
 * better sphere. Three deliberate mitigations:
 *
 *   · The camera SWEEPS a bounded arc of longitude rather than spinning freely, so
 *     it never faces the empty middle of the Pacific. Same reasoning, and nearly
 *     the same numbers, as the flat map's origins-and-destinations corridor.
 *   · Every city and country is named in text under the globe (screen-reader only), so
 *     nothing is available ONLY by waiting for the sphere to turn — that text is also
 *     what a crawler sees, since the globe itself is client-rendered.
 *
 * ── Layers ──────────────────────────────────────────────────────────────────
 * Arcs, origins and destinations are Mapbox GeoJSON sources, which means Mapbox
 * clips them at the horizon for free — the thing that was hand-written for COBE.
 * Destination labels are a `symbol` layer, so Mapbox's own collision engine drops
 * the ones that would overlap: the dense UK cluster that needed hand-authored
 * offsets and leader lines on the flat map declutters itself here.
 *
 * Only the hover card is our own DOM, positioned with `map.project()` — and that
 * needs `isFacing()`, because `project()` returns coordinates for far-side points
 * too.
 */

const MAPBOX_VERSION = "3.7.0";
const MAPBOX_JS = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.js`;
const MAPBOX_CSS = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.css`;

/**
 * Camera sweep, in longitude. Centre 15°E ±60° covers 45°W → 75°E: it reaches New
 * York and Toronto at one end and centres on India at the other, keeps Europe
 * within 90° of both extremes so the dense destination cluster never leaves, and
 * never approaches 180° where there is nothing but ocean.
 */
const SWEEP_CENTRE_LON = 15;
const SWEEP_DEG = 60;
const SWEEP_MS = 90000;
/** Tilted a little north: the network sits almost entirely above the equator. */
const CAMERA_LAT = 22;
/**
 * The projection, and the zoom that frames the sphere in it.
 *
 * ── BACK TO A GLOBE, after a spell as a flat mercator band ──────────────────
 * The map was briefly `mercator` at full window width — a band, not a sphere — and the
 * reasoning was sound for that shape: mercator is a rectangle edge to edge, where Natural
 * Earth's curved meridians leave white wedges in the corners of a full-bleed strip.
 *
 * It is a globe again because that is the thing this hero is. What a sphere costs is real —
 * it hides half of itself, which is why the camera sweeps a bounded arc of longitude and
 * why every city is named in the screen-reader text below — but a flat band of the world is
 * a different graphic, not a better-framed version of the same one.
 *
 * ⚠️  A GLOBE'S ZOOM IS A CONSTANT, and a mercator band's cannot be. That is the one thing
 * to keep straight if this is ever switched again:
 *   · Mercator draws the world `512 * 2^zoom` pixels wide — an absolute size with no
 *     reference to the container — so the band needed `log2(width / 512)`, recomputed on
 *     resize, or the world came out wider than its frame at every size but one.
 *   · A globe is a sphere fitted to the viewport, so one zoom frames it at any width, and
 *     `map.setZoom` on resize is not merely unnecessary — it re-frames a sphere that was
 *     already correct.
 *
 * ⚠️  ZOOM IS THE ONLY LEVER ON THE GLOBE'S SIZE, and the slot is not. For the globe projection
 * Mapbox draws the sphere at an ABSOLUTE pixel size derived from zoom, with no reference to its
 * container — so widening `.globeSlot` does not widen the globe, it adds transparent margin and
 * sinks it in a taller box.
 *
 * ── WHICH IS WHY THIS IS A FUNCTION, NOT A CONSTANT ────────────────────────
 * It was a flat 2.4, and that meant a sphere of the same PIXEL size at every viewport — so its
 * share of the window fell away as the window grew. Measured, at a flat 2.4:
 *   1280px -> 809px (63%)   1440px -> 841px (58%)
 *   1728px -> 866px (50%)   1920px -> 866px (45%)
 * The globe was "big" only on the laptop it was tuned on. It also stopped growing entirely at
 * 866px, because `.globeSlot` capped its canvas at 1000px and the sphere cannot exceed it.
 *
 * So zoom now tracks the viewport. `1.33` is the measured exponent, not a guess: the rendered
 * diameter scales as roughly `2^(zoom / 1.33)` on this projection at this frame, so a doubling of
 * window width needs +1.33 of zoom to keep the same share.
 *
 * ── WHAT ACTUALLY LIMITS THE SIZE: THE CANVAS, NOT THE OFFSET ──────────────
 * ⚠️  Two earlier explanations of the ceiling were WRONG, and both are recorded because each
 * looked convincing and cost a round trip:
 *
 *   1. "The camera offset shifts the sphere up out of its canvas." It does not. For a globe,
 *      `offset` pans the camera — it changes which part of the sphere faces you — it does not
 *      translate the disc within the frame. The sphere stays centred in its canvas.
 *   2. "Check `project([lng, 90])` — the north pole — and keep it above 0." That is a PROXY and a
 *      bad one: at 52°N the pole sits well inside the disc, not on its top edge. It reported zoom
 *      2.55 as safe when the limb was visibly flat-topped, and it reported clipping at 2.75 when
 *      the limb was fine.
 *
 * The real constraint is simply that the SPHERE MUST FIT ITS CANVAS, and the only way to check it
 * is to inspect the rendered pixels: walk down from the canvas's top edge and measure the width of
 * the non-white run. A curved limb starts a few pixels wide and widens; a clipped one starts
 * hundreds of pixels wide at the very first row.
 *
 * Measured that way, the usable diameter is about 0.91 of the canvas:
 *   canvas  907px -> 841px curved (+13px clear), 902px FLAT
 *   canvas 1224px -> 1117px curved (+12px clear), 1139px borderline, 1172px FLAT
 *
 * So the globe is made bigger by growing `.globeSlot` (the canvas) and raising this to match —
 * never by raising this alone. 2.8 at 1440 gives a 1117px sphere in a 1224px canvas: 78% of the
 * window, up from 58%.
 *
 * The clamp bounds the extrapolation rather than the geometry: at very narrow or very wide
 * viewports the log2 term runs away from the range these numbers were measured in.
 */
const PROJECTION = "globe";

/** The share of the window the sphere is drawn at, and the calibration behind it. */
const ZOOM_AT_1440 = 2.8;
const ZOOM_PER_DOUBLING = 1.33;
const ZOOM_MIN = 2.5;
const ZOOM_MAX = 3.35;

const globeZoom = (windowWidth: number) => {
  const w = Math.max(320, windowWidth);
  const z = ZOOM_AT_1440 + ZOOM_PER_DOUBLING * Math.log2(w / 1440);
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
};

/**
 * How often the `arcs` source may be rewritten, in ms — parked, and while the camera flies.
 *
 * See `arcWroteAtRef` for why this source alone still uses `setData`. The numbers are
 * ~33ms (30fps) parked and ~66ms (15fps) in flight, and the reason for the second one is
 * that a `setData` competes with the basemap for Mapbox's worker pool: during a flight the
 * basemap is parsing tiles for a whole new part of the world, and losing that race is what
 * shows as a beige block where the map should be.
 */
const ARC_WRITE_MS = 33;
const ARC_WRITE_MS_FLYING = 66;

/**
 * Quantisation step for the numbers pushed through `setFeatureState`.
 *
 * These animate continuously, so comparing raw floats would make every frame a change and
 * defeat the skip entirely. 1/64 is finer than a screen pixel of movement on any of the
 * things they drive (a 12% icon grow, a 30px ring, a 22px pulse) and coarse enough that a
 * value at rest reliably compares equal.
 */
const STATE_STEP = 64;
const q = (v: number) => Math.round(v * STATE_STEP);

/* ───────────────────────────────────────────────────── the city tour ── */

/**
 * The globe visits ONE listed city at a time, and every person on it sends demand to
 * that one city. This replaced a permanent map of eighteen destinations criss-crossed
 * by arcs between fixed origin→city pairs.
 *
 * The old version was a picture of a NETWORK; this is a picture of a BOOKING. Eighteen
 * small pins each taking a couple of arcs read as "amber is in a lot of places", which
 * the copy already says — and at the sizes the pins had to be to all coexist, none of
 * them was the subject of the frame. One large pin with every arc converging on it says
 * the thing the section is actually for: wherever your building is, this is the demand
 * that arrives at it.
 *
 * Named rather than indexed. `PROPERTIES` is edited often — a city added or reordered
 * silently rewrites a hard-coded index list into a different tour, and nothing would
 * fail. A label that stops matching drops that stop and leaves the rest correct.
 */
const TOUR_LABELS = [
  // London, Sydney and New York lead, in that order — the three markets a partner is
  // most likely to be looking for, and three continents inside the first 24 seconds so
  // the tour is legibly global before anyone has waited for it.
  "London",
  "Sydney",
  "New York",
  // Then one city per remaining country, ordered to keep consecutive stops far apart:
  // two neighbouring cities in a row make the camera barely move and the stop reads as
  // a stutter rather than a journey.
  "Toronto",
  "Dubai",
  "Berlin",
  "Auckland",
  "Singapore",
  "Barcelona",
  "Hong Kong",
  "Dublin",
  "Paris",
  "Florence",
];

const TOUR = TOUR_LABELS.map((label) =>
  PROPERTIES.findIndex((city) => city.label === label),
).filter((i) => i >= 0);

/** How long each city holds. The brief: eight seconds a stop. */
const STOP_MS = 8000;

/**
 * The camera's flight to the next city, and the badge's opening.
 *
 * FLY_MS is a CEILING, not the duration — the actual flight is scaled by how far the hop
 * is (see `flightMs`), so London to Dublin does not take as long as London to Sydney. A
 * fixed duration makes short hops feel sluggish and long ones feel rushed, and the eye
 * reads both as mechanical.
 *
 * The badge waits. `OPEN_FROM` holds it shut until the camera is most of the way there,
 * so the sequence is: the map travels, the map settles, and THEN the property arrives on
 * it. Opening it at the same moment the flight starts means it grows while the ground
 * beneath it is still sliding, which reads as one lurch rather than two events.
 */
const FLY_MS = 2600;

/**
 * The building's arrival, and the label's.
 *
 * ⚠️  THEY ARE SEPARATE, and the reason is a bug worth not repeating. Both used to run off
 * one `open` that was held back until the camera was 62% of the way to the city and then
 * grew the mark from 35% size. Which meant the destination — the SUBJECT of the frame —
 * was either absent or a speck for the first ~2.2 seconds of every eight-second stop. Over
 * a quarter of the time, the thing the map is about was missing.
 *
 * So the building now appears immediately and at nearly full size: it pops in at the new
 * city and the camera flies to meet it, which is what a map flying to a marker looks like.
 * Only the LABEL waits, because a panel of text sliding across the screen during a pan is
 * genuinely hard to read, and a label is the one thing that can afford to arrive late.
 *
 * `OPEN_MS` lived here — 380ms, the last of that scale-in, floored at 0.86 so the mark was
 * legible from its first frame. It is gone, and the reason is not a change of mind about
 * the staging: `icon-size` is a LAYOUT property, so the only way to animate it is to
 * rewrite the symbol source every frame, which re-runs placement, which Mapbox defers
 * during exactly the camera flight the settle ran inside. It was a 14% grow bought at the
 * price of the whole map's tile budget. The building simply appears at full size now, which
 * is what the paragraph above says it should do anyway.
 */
const LABEL_FROM = 0.7;
const LABEL_MS = 300;

/**
 * How long a hop takes, from how far it is.
 *
 * Sub-linear on distance — a hop ten times longer is not ten times slower — with a floor
 * that keeps even neighbouring cities from snapping.
 */
const flightMs = (km: number) => Math.min(FLY_MS, 900 + km / 9);

/**
 * Cubic ease in and out. Symmetric on purpose: the camera should leave and arrive with
 * the same deliberation, and an ease-out alone starts at full speed, which is what makes
 * a pan feel like a jump-cut that happens to be animated.
 */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * How many of the thirteen origins send to each city, and the window they launch in.
 *
 * Not all of them. Thirteen arcs converging on one point is a starburst — legible as a
 * shape, illegible as thirteen separate journeys.
 *
 * Eight became five when ARC_MS was raised to slow the flights down. The two numbers are
 * bound together and cannot both be chosen: the window is `STOP_MS - ARC_MS`, so a slower
 * arc leaves less room to launch in, and holding eight senders would have crammed them
 * into a 3.1s window at ~360ms apart — thirteen in the air, back to a starburst, and the
 * slower flight would have bought nothing.
 *
 * The window closes at `STOP_MS - ARC_MS` so the last arc LANDS as the stop ends. Launch
 * any later and the camera flies away from an arc still in the air, which reads as the
 * demand being dropped rather than delivered.
 */
const SENDERS_PER_STOP = 5;
const SEND_FROM_MS = 900;
const SEND_TO_MS = STOP_MS - ARC_MS;

/**
 * Where the map is framed, and it does not move.
 *
 * The latitude is DERIVED from the band, not picked. The layer is 490px tall and the
 * world is 1440px wide, so in mercator the stretch from +60 (northern Europe, the
 * northernmost thing the tour visits) down to -40 (past Auckland, the southernmost) is
 * 477px — it just fits. Centring that stretch means centring on the latitude halfway
 * between them IN PROJECTED SPACE, which is not their average: mercator stretches as it
 * goes north, so the midpoint of 0.290 and 0.621 lands at +16, not at +10.
 *
 * The longitude puts Europe and Africa in the middle, which is where the destinations and
 * the origins respectively are; the Americas fall to the left and Asia to the right, so no
 * arc has to leave the frame to be drawn.
 */
const MAP_CENTRE: [number, number] = [15, 16];

/**
 * Which origins send to stop `n`, and in what order — SENDERS_PER_STOP of them, SPREAD
 * across the distance range rather than taken off the near end of it.
 *
 * ⚠️  It was "the five nearest", and that broke the moment European and North American
 * origins were added. Every European stop was then fed entirely by European origins:
 * Berlin got Munich, Milan, Rotterdam, Lyon and Birmingham, and a page whose whole claim
 * is international demand drew five short hops inside one continent. Sampling evenly
 * across the sorted list instead takes the nearest, the farthest, and three in between —
 * so a stop always shows both the domestic move and the long haul.
 *
 * The `+ stop` rotation shifts which rank each slot lands on from one stop to the next, so
 * a given city is not always fed by the same five. Deterministic; no randomness, so SSR
 * and client agree.
 *
 * Memoised per stop rather than sorted every frame: this is 13 haversines and a sort,
 * and the answer only changes when the tour advances. `kmBetween` is declared further
 * down the file, which is safe ONLY because nothing calls this until the frame loop is
 * running — computing the table at module scope would hit the temporal dead zone.
 */
const sendersCache: number[][] = [];

const sendersFor = (stop: number) => {
  if (!sendersCache[stop]) {
    const city = PROPERTIES[TOUR[stop]];
    const byDistance = ORIGINS.map((_, i) => i).sort(
      (a, b) =>
        kmBetween(city.location, ORIGINS[a].location) -
        kmBetween(city.location, ORIGINS[b].location),
    );
    const n = byDistance.length;
    const picked: number[] = [];
    for (let k = 0; k < Math.min(SENDERS_PER_STOP, n); k += 1) {
      // Evenly spaced ranks across the whole sorted list, rotated by the stop so the same
      // five are not chosen every time this city comes round.
      const rank = Math.round((k * (n - 1)) / (SENDERS_PER_STOP - 1));
      const idx = byDistance[(rank + stop) % n];
      if (!picked.includes(idx)) picked.push(idx);
    }
    sendersCache[stop] = picked;
  }
  return sendersCache[stop];
};

/** Symmetric ease, so a hop leaves and arrives with the same deliberation. */
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * How large the destination badge is drawn, before `symbolScale`.
 *
 * 1.3 against the pin's 40px box (34 tall plus 3px of padding each side) gives ~52px on
 * screen — a shade under twice the 27px the origin faces sit at, so the destination reads as
 * the subject of the frame without becoming a separate object.
 *
 * Up from the 1.1 the isometric building used, and that is arithmetic rather than taste: the
 * building was drawn into a 76px box, so the same multiplier on a 40px pin would have put the
 * destination smaller than the faces around it. The number that matters is box x scale.
 *
 * Unlike the building this is a FLAT GLYPH, so it takes the scaling cleanly — the old note
 * here warned that a photographic badge softens when the icon-size expression enlarges it,
 * which no longer applies.
 */
const DEST_ICON_SCALE = 1.3;

/**
 * One blue for the whole network: origin dots, connection lines and destination pins.
 *
 * The hierarchy is carried by SHAPE and SIZE rather than hue — an 8px dot against a
 * 34px pin — now that colour no longer separates the two ends. That also means the arcs
 * are a flat colour: they used to run pink at the source to blue on arrival, which read
 * as purple across most of their length.
 *
 * Direction is still legible without the gradient, from the line growing out of its
 * origin and from the ring that pulses on the destination as it lands.
 */
const NETWORK_BLUE = "#1c64f2";

/**
 * ── `TOP_LABELS` AND `MIN_ANCHOR_KM` LIVED HERE ─────────────────────────────
 * They chose which destinations kept a permanent label: highest volume first, skipping
 * any city within 1200km of one already picked, because London and Manchester are 262km
 * apart and their labels landed on top of each other. Both are gone because nothing reads
 * them any more — they fed the `pinned` and `labelOn` feature properties, and the Mapbox
 * label layer that used those was replaced by the DOM tooltip (see the note where that
 * layer used to be) long before this. `kmBetween` survives; the flight timing uses it.
 */
const kmBetween = (a: [number, number], b: [number, number]) => {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const la1 = (a[0] * Math.PI) / 180;
  const la2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};

const ROUTES_BY_ORIGIN = ORIGINS.map((_, i) => ROUTES.filter((r) => r.from === i));

/**
 * Load Mapbox GL once per page, no matter how many components ask for it.
 *
 * Kept as a module-level promise rather than per-component state: two instances
 * mounting would otherwise inject two copies of a 250KB script. Resolves false when
 * the script cannot load at all, which the caller treats the same as no WebGL.
 */
let loader: Promise<boolean> | null = null;
const loadMapbox = (): Promise<boolean> => {
  if (loader) return loader;
  loader = new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (typeof mapboxgl !== "undefined") {
      resolve(true);
      return;
    }
    if (!document.querySelector(`link[href="${MAPBOX_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = MAPBOX_CSS;
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = MAPBOX_JS;
    script.async = true;
    script.onload = () => resolve(typeof mapboxgl !== "undefined");
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
  return loader;
};


/**
 * The origin faces.
 *
 * Thirteen illustrated busts, one per source country in `ORIGINS` order — and fewer of
 * them than there are origins now that the list carries near-haul and domestic markets
 * too, so the set repeats. `makeBadge` is handed `faces[i % faces.length]`, which is
 * deliberate: a repeated face on two continents reads as two students, and it is a
 * better failure than an origin with no face at all.
 *
 * These replaced a set of DiceBear "Personas" fetched from their API. Personas is CC BY
 * 4.0 and needs an attribution this page does not carry, and the illustrated set is what
 * the rest of amber uses — the hero's own headline avatars are from it.
 */
import face01 from "../../assets/avatars/face-01.png";
import face02 from "../../assets/avatars/face-02.png";
import face03 from "../../assets/avatars/face-03.png";
import face04 from "../../assets/avatars/face-04.png";
import face05 from "../../assets/avatars/face-05.png";
import face06 from "../../assets/avatars/face-06.png";
import face07 from "../../assets/avatars/face-07.png";
import face08 from "../../assets/avatars/face-08.png";
import face09 from "../../assets/avatars/face-09.png";
import face10 from "../../assets/avatars/face-10.png";
import face11 from "../../assets/avatars/face-11.png";
import face12 from "../../assets/avatars/face-12.png";
import face13 from "../../assets/avatars/face-13.png";

const FACES = [
  face01,
  face02,
  face03,
  face04,
  face05,
  face06,
  face07,
  face08,
  face09,
  face10,
  face11,
  face12,
  face13,
];

/**
 * ⚠️  EXPORTED, along with `BADGE`, `makeBadge` and `ORIGIN_SPRITE`, for `Features`' inventory
 * globe — which draws the same origin avatars on a second map.
 *
 * Exported IN PLACE rather than moved to a shared module. Extracting them was tried and the
 * clean seam is not there: `makeBadge` sits between this file's own `ORIGIN_ICON_SCALE` and
 * `DEST` geometry, so lifting it drags unrelated constants with it. Both consumers are on the
 * same page and in the same chunk, so an import costs nothing that a move would save.
 *
 * Decode the avatar set, resolving to one element per face and `null` for any that fail.
 *
 * `decode()` rather than the `load` event where it exists: it resolves once the bitmap is
 * actually ready to paint, and an image that has fired `load` can still cost a
 * synchronous decode on first draw — which would be thirteen of them in a row inside the
 * map's load handler.
 *
 * Never rejects. One unreachable file should cost that badge its face, not cost the map
 * its pins.
 */
export const loadFaces = (): Promise<Array<HTMLImageElement | null>> =>
  Promise.all(
    FACES.map(
      (src) =>
        new Promise<HTMLImageElement | null>((resolve) => {
          // `document.createElement`, not `new Image()`: this module imports the project's
          // own `Image` React component, which shadows the DOM constructor entirely.
          const img = document.createElement("img");
          img.onload = () => {
            const done = () => resolve(img);
            if (typeof img.decode === "function") img.decode().then(done, done);
            else done();
          };
          img.onerror = () => resolve(null);
          img.src = src;
        }),
    ),
  );



/**
 * The one sprite id every destination's `icon-image` resolves to.
 *
 * A constant rather than a literal at the two call sites: those two are the feature builder and
 * the frame loop, and the frame loop replaces the whole FeatureCollection every frame. A typo in
 * either one empties the globe of destinations silently — a data-driven `icon-image` that does not
 * resolve draws nothing and logs nothing.
 */
const DEST_SPRITE = "amber-dest";
/** Sprite id prefix for the face that stands at each origin. */
export const ORIGIN_SPRITE = "amber-origin";

/**
 * Pin geometry at 1x, in CSS pixels. The tip is the coordinate.
 *
 * Only destinations are pins now. Origins became circular badges (see `BADGE`), so the two ends of
 * the network are told apart by SHAPE rather than by the filled-vs-outlined contrast that used to
 * do it — a pin dropped on a place against a person somewhere in a country.
 */
const DEST_PIN = { w: 26, h: 34, r: 11, cx: 13, cy: 12, pad: 3 };

interface PinSpec {
  box: typeof DEST_PIN;
  fill: string;
  stroke: string;
  glyphColor: string;
  /** Draws the glyph into a 15x15 box at the origin; the caller has already scaled. */
  glyph: (ctx: CanvasRenderingContext2D) => void;
}

/**
 * Draw a pin to an ImageData for `map.addImage`.
 *
 * A teardrop, not a circle-plus-triangle: the two shapes filled separately leave a seam
 * the moment the outline is stroked, so the silhouette is one path — arc across the top
 * of the head between the two points where a line from the tip is tangent to the head,
 * then down to the tip. `acos(r / d)` gives that tangent angle.
 *
 * Rendered at `ratio` and handed to Mapbox with a matching `pixelRatio`, so it is crisp
 * on retina without being drawn twice the size everywhere else.
 */
const makePin = (spec: PinSpec, ratio: number) => {
  const { box, fill, stroke, glyphColor, glyph } = spec;
  const canvas = document.createElement("canvas");
  // Padded, so the drop shadow has somewhere to fall. Without it the shadow is clipped by the
  // sprite's own edge and reads as a hard band down one side rather than as depth.
  canvas.width = (box.w + box.pad * 2) * ratio;
  canvas.height = (box.h + box.pad * 2) * ratio;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(ratio, ratio);
  ctx.translate(box.pad, box.pad);

  const tipY = box.h - 1.5;
  const gamma = Math.acos(box.r / (tipY - box.cy));
  const down = Math.PI / 2;

  ctx.beginPath();
  ctx.arc(box.cx, box.cy, box.r, down + gamma, down - gamma + Math.PI * 2, false);
  ctx.lineTo(box.cx, tipY);
  ctx.closePath();
  // Shadow on the fill only. Set here and cleared before the stroke, or the outline gets a shadow
  // of its own on top and the pin picks up a muddy double edge.
  ctx.save();
  ctx.shadowColor = "rgba(17, 25, 40, 0.22)";
  ctx.shadowBlur = 3.4;
  ctx.shadowOffsetY = 0.8;
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
  // Outline, so a pin over green land or blue ocean keeps its shape. 2.2px to match the badges'
  // white ring — at 1.8 the two ends of the network were outlined differently, which is the kind of
  // half-pixel inconsistency that makes a set look assembled rather than designed.
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = stroke;
  ctx.stroke();

  // Glyph, knocked out inside the head. The 15x15 source box is scaled to sit in the
  // head and centred on its ink rather than on the box, which is off-centre vertically.
  const glyphScale = (box.r * 2 * 0.62) / 15;
  ctx.save();
  ctx.translate(box.cx - 7.5 * glyphScale, box.cy - 7.2 * glyphScale);
  ctx.scale(glyphScale, glyphScale);
  ctx.fillStyle = glyphColor;
  glyph(ctx);
  ctx.restore();

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

/**
 * Recolour an icon file to a WHITE silhouette, keeping its alpha shape.
 *
 * ⚠️  `building-office.svg` ships `fill="black"`, and it has to be white to knock out of a blue
 * pin. `drawImage` cannot recolour, and the file cannot be tinted through CSS because it is
 * being rasterised onto a canvas rather than mounted in the DOM. So: draw it, then flood the
 * canvas with white through `source-in`, which keeps only the pixels the glyph already covered.
 *
 * Rendered at 96px rather than at the ~14px the glyph occupies: an SVG rasterised small and
 * then scaled up is mush, where one rasterised large and scaled DOWN by `drawImage` stays
 * clean. 96 clears the largest the glyph is ever drawn (about 54px, at `pinRatio` 4).
 */
const MASK_PX = 96;

const whiteMask = (art: HTMLImageElement) => {
  const canvas = document.createElement("canvas");
  canvas.width = MASK_PX;
  canvas.height = MASK_PX;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(art, 0, 0, MASK_PX, MASK_PX);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, MASK_PX, MASK_PX);
  return canvas;
};

/**
 * Decode the pin's glyph. Never rejects — a pin with no glyph is still a pin, and a blue
 * teardrop on the right city beats no destination at all.
 */
const loadDestIcon = (): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    // `document.createElement`, not `new Image()`: this module imports the project's own
    // `Image` React component, which shadows the DOM constructor entirely.
    const img = document.createElement("img");
    img.onload = () => {
      const done = () => resolve(img);
      if (typeof img.decode === "function") img.decode().then(done, done);
      else done();
    };
    img.onerror = () => resolve(null);
    img.src = buildingOffice;
  });

/**
 * The destination pin: the office-building icon in a teardrop, in amber's blue.
 *
 * ⚠️  THE GLYPH CANNOT COME FROM MAPBOX'S SPRITE ON THIS MAP, which is worth writing down so
 * nobody spends an afternoon on it. `mapbox/standard` is a style PACKAGE and its sprite is
 * internal, so it publishes no icons by name — measured in the sibling component:
 * `map.listImages()` on Standard returns only the images our own code added, where
 * `streets-v12` returns 440 including `lodging`. Asking Standard for `icon-image: "lodging"`
 * resolves to nothing, draws nothing and warns nothing.
 *
 * Partner With Us's `InventoryGlobe` gets the real sprite icon by running on `streets-v12`
 * instead. That trade is not available here: this globe's green-land, blue-ocean look is
 * Standard's day preset and it is the approved one, so borrowing one icon would cost the
 * entire basemap.
 *
 * The teardrop is `makePin`'s, so its TIP is the coordinate — which is what makes this point
 * at a city rather than sit near one. `NETWORK_BLUE` is the blue the arcs and the origin
 * badges already use, so both ends of every journey are plainly the same network.
 */
const destPinSpec = (mask: HTMLCanvasElement | null): PinSpec => ({
  box: DEST_PIN,
  fill: NETWORK_BLUE,
  stroke: "#ffffff",
  glyphColor: "#ffffff",
  glyph: (ctx) => {
    // `makePin` has already translated and scaled into a 15x15 glyph box, so this draws at
    // the box's own coordinates and the pin decides how large that is.
    if (mask) ctx.drawImage(mask, 0, 0, 15, 15);
  },
});

/**
 * Origin badge geometry at 1x, in CSS pixels. The CENTRE is the coordinate, not a tip.
 *
 * A circle, not a teardrop. The two ends of the network are now different shapes as well as
 * different sizes — a destination is a pin dropped on a place, an origin is a person somewhere in
 * that country — which does more work than the filled-vs-outlined contrast it replaces.
 *
 * `pad` is room for the soft glow to fall into. Without it the shadow is clipped by the sprite's
 * own edge and reads as a hard band rather than a glow.
 */
export const BADGE = { size: 34, ring: 2.2, pad: 3 };

/**
 * How much of `BADGE.size` the flags and the travelling faces are actually drawn at.
 *
 * It was 0.46, set when every mark was ALSO multiplied by a `symbolScale` of 1.7 from the
 * hero zoom — so the two together drew a 34px badge at about 27px. Turning the hero zoom
 * off for the full-bleed map dropped `symbolScale` to 1 and took the faces down to ~16px
 * with it. 0.8 restores the size that pair used to produce, from the one number that is
 * still doing anything.
 */
const ORIGIN_ICON_SCALE = 0.8;

/**
 * The destination badge, deliberately SMALLER than the origin badge above.
 *
 * 26 against 34. Two reasons, and the second is the one that forced it:
 *
 *   · HIERARCHY. An origin is a person — a face, drawn to be looked at. A destination is a
 *     marker for a place. Drawing them the same size gave a marker the same presence as a
 *     character.
 *   · DENSITY. Eighteen cities include London, Manchester, Dublin, Paris, Berlin, Barcelona and
 *     Florence, and at the 450px the "Why partners" panel draws the sphere those seven fall
 *     inside a patch about 90px across. At 34 they piled into an unreadable stack of identical
 *     discs. Area falls ~42% at 26, which is most of what unpicks the clump; `icon-allow-overlap`
 *     on the layer does the rest.
 */
/**
 * The destination building, in sprite units.
 *
 * All three of these are MEASURED off `corporate-building.svg`, not chosen — the same
 * discipline the room photograph needed, for the same reason:
 *
 *   · `aspect`  — its content's width over its height (286 x 384). Get it wrong and the
 *     building leans or squats.
 *   · `baseY`   — how far down the artwork its footing sits, 0.87. NOT the bottom of the
 *     image: an isometric solid's lowest pixel is the front corner of its base, so
 *     anchoring there stands the building on its own front edge and the arriving arcs
 *     gather at the kerb instead of under it.
 *   · it is horizontally centred in its own frame (measured: 0.5017), which is why
 *     nothing here corrects for that.
 *
 * Swap the artwork and all three have to be measured again.
 */
const DEST = {
  drawH: 76,
  aspect: 286 / 384,
  baseY: 0.87,
  /** Room under the footing for the contact shadow. */
  pad: 8,
};

/**
 * Draw an origin badge to an ImageData for `map.addImage`.
 *
 * Two layers: a white disc, then the face clipped into it.
 *
 * The white disc is load-bearing, not a frame. It is what lets a badge sit on green land
 * or blue ocean and still read as one object; the coloured disc each face carries has too
 * little contrast against either on its own.
 */
export const makeBadge = (face: HTMLImageElement | null, ratio: number) => {
  const box = BADGE.size + BADGE.pad * 2;
  const canvas = document.createElement("canvas");
  canvas.width = box * ratio;
  canvas.height = box * ratio;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(ratio, ratio);

  const c = box / 2;
  const rOuter = BADGE.size / 2;
  const rFace = rOuter - BADGE.ring;

  // Set before the fill and cleared after, so the shadow applies to this disc alone —
  // left on, it would also darken the edge of the face drawn over it.
  ctx.save();
  ctx.shadowColor = "rgba(17, 25, 40, 0.22)";
  ctx.shadowBlur = 3.4;
  ctx.shadowOffsetY = 0.8;
  ctx.beginPath();
  ctx.arc(c, c, rOuter, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  if (face) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(c, c, rFace, 0, Math.PI * 2);
    ctx.clip();
    // Drawn to the circle EXACTLY, no oversizing. These are square images whose coloured
    // background fills the whole frame, so scaling up would crop the disc rather than the
    // head — the opposite of what a cut-out bust needs.
    ctx.drawImage(face, c - rFace, c - rFace, rFace * 2, rFace * 2);
    ctx.restore();
  } else {
    // No face decoded: a plain dot in the network's own blue, so the origin is still on
    // the map.
    ctx.beginPath();
    ctx.arc(c, c, rFace * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = NETWORK_BLUE;
    ctx.fill();
  }

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

/* ── THE ISOMETRIC BUILDING IS GONE ────────────────────────────────────────
   `makeDestBadge` and `loadDestArt` lived here, plus the `corporate-building.svg` import: a
   drawn building over a soft contact ellipse, with `DEST` carrying its measured height,
   aspect and footing.

   Replaced by the office-building icon on `makePin`'s teardrop — see `destPinSpec`. The pin
   wins for one reason the building could not: a teardrop's TIP is the coordinate, so it points
   at a city, where an isometric solid can only sit near one and hope the eye reads its base as
   the anchor. `DEST` went with them; the tooltip and the icon offset are derived from
   `DEST_PIN` now. `corporate-building.svg` is still in `assets/icons/`. */

/** Seed data for a source whose features are written by the frame loop. */
const empty = { type: "FeatureCollection", features: [] as any[] };


/**
 * Which part of the network the globe is emphasising.
 *
 * Driven by the stepped rail in "Your place is made for amber", so each claim in that
 * rail changes what the sphere is showing rather than repeating one picture four times.
 * `all` is the hero's state and the default.
 */
export type GlobeFocus = "all" | "origins" | "reach" | "arcs" | "destinations";

interface DemandGlobeProps {
  /**
   * Fired once the globe is on screen and drawable — or once it has given up and
   * shown the photo instead. The hero uses it to start its entrance sequence, which
   * cannot be a fixed CSS delay: Mapbox needs a variable 1–3s to fetch its style and
   * first tiles, so a timed animation would play to an empty box.
   *
   * Called on FAILURE as well as success on purpose. If it only fired on success, a
   * blocked CDN or a rejected token would leave the hero copy hidden forever.
   */
  onReady?: () => void;
  /** What to emphasise; see `GlobeFocus`. Defaults to `all`. */
  focus?: GlobeFocus;
  /**
   * Added to `ZOOM` when the map is created.
   *
   * ⚠️  THE SPHERE'S SIZE COMES FROM HERE, NOT FROM THE CANVAS. In globe projection
   * Mapbox draws the earth at a diameter set by the zoom level; the canvas only decides
   * how much of the page that drawing is allowed to cover. So enlarging the container
   * alone does NOT enlarge the globe — it adds empty space around an unchanged sphere.
   *
   * Which makes this the other half of GlobeTravel's HERO_ZOOM: that grows the canvas,
   * this grows the sphere inside it, and the two must move together or one of them is
   * just padding. Since a diameter doubles per zoom level, the matching boost for a
   * canvas scaled by k is log2(k).
   *
   * Read once, at map creation. Changing it later needs `map.setZoom`, which is not
   * something to do per frame.
   */
  zoomBoost?: number;
}

const DemandGlobe = ({ onReady, focus = "all", zoomBoost = 0 }: DemandGlobeProps) => {
  /**
   * Every hand-authored pixel size in the layers below is multiplied by this.
   *
   * ⚠️  A zoom level changes the SPHERE and nothing else. Pins, labels, halos and arcs
   * are symbol and line layers, and Mapbox draws those at the pixel sizes given here
   * whatever the zoom is — so a `zoomBoost` on its own leaves the furniture behind at
   * its old size while the globe under it grows.
   *
   * That is not merely a proportion problem. The globe is shrunk back down by a CSS
   * transform on GlobeTravel's layer, and a CSS transform scales EVERYTHING — so at the
   * settled size the sphere returns to its original diameter while the pins arrive at
   * 1/HERO_ZOOM of the size they used to be. They looked visibly smaller, which is the
   * bug this fixes.
   *
   * `2 ** zoomBoost` is the linear factor the boost represents (a diameter doubles per
   * zoom level), so multiplying by it makes the furniture travel with the sphere: bigger
   * with it at the top of the page, and back to exactly its old size once the transform
   * has shrunk both.
   */
  const symbolScale = 2 ** zoomBoost;
  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const arrivedRef = useRef<number[]>(PROPERTIES.map(() => 0));
  /** Mirrors `focus` for the render loop, which runs outside React. */
  const focusRef = useRef<GlobeFocus>(focus);
  /**
   * Set while the reader is dragging the map, which pauses the tour.
   *
   * NOT set by hovering — see the note on the `dragstart` handler for why that was removed
   * and what it broke. Released when the cursor leaves the canvas.
   */
  const heldRef = useRef(false);
  /**
   * Total wall-clock time the tour has spent held, and the previous frame's timestamp.
   *
   * Subtracted from `elapsed` so the tour clock stops while the map is being dragged. Without
   * it the stops advance over a camera that is not following them, which is the desync the
   * hover-hold used to cause.
   */
  const heldMsRef = useRef(0);
  const lastFrameRef = useRef(0);
  /**
   * The stop the camera has already been sent to. -1 until the first frame, which is what
   * distinguishes "open here" from "fly here" — see the flight in the frame loop.
   *
   * A ref, not state: the frame loop is its only reader and its only writer, and a stop
   * change must not re-render the component.
   */
  const flownToRef = useRef(-1);
  /**
   * Which city is currently IN the `dests` source.
   *
   * ⚠️  The destination source must NOT be rewritten every frame — see the note where it
   * is written. This is how the loop knows there is nothing to write, and it is a plain
   * city index rather than the signature it used to be: everything that animates within a
   * stop is feature state now, so the ONLY thing that can make this source stale is the
   * tour moving to a different city.
   */
  const destCityRef = useRef(-1);
  /**
   * The feature state last pushed for each origin, so the loop can skip the ones that have
   * not moved.
   *
   * `setFeatureState` is far cheaper than a `setData` — a paint-attribute upload, no
   * worker, no re-tile — but it is not free, and twenty-six of them a frame when at most
   * five origins are ever lit is twenty-one calls a frame doing nothing. Quantised before
   * comparison so a value easing by a thousandth does not count as a change.
   */
  const originStateRef = useRef<string[]>(ORIGINS.map(() => ""));
  /** Same, for the one destination. */
  const destStateRef = useRef("");
  /**
   * When the `arcs` source was last written, and the interval it is held to.
   *
   * The arcs are the ONE source whose geometry genuinely changes every frame — they are a
   * growing comet, and there is no paint property that can reveal a moving window of a
   * static line (`line-trim-offset` hides a single range, so it cannot express "show only
   * between tail and head"). So this source keeps its `setData`, and is rate-limited
   * instead.
   *
   * Two rates, because the constraint is not the same at both moments. While the camera is
   * flying, the basemap is fetching and parsing tiles for a whole new part of the world and
   * needs the workers — and nobody reads the frame rate of a line sliding across a map that
   * is itself sliding. While the camera is parked, the arcs are the only thing moving and
   * deserve the smoother rate.
   */
  const arcWroteAtRef = useRef(0);

  const [failed, setFailed] = useState(false);
  /**
   * The tour tooltip's element, positioned DIRECTLY every frame rather than through
   * state.
   *
   * It is on screen for the whole tour, so a state write per frame would re-render the
   * component sixty times a second for the sake of two numbers in a transform.
   */
  const tipRef = useRef<HTMLDivElement>(null);
  /**
   * What the tooltip SAYS, which changes about eight times a stop rather than every
   * frame — so this half is ordinary state, written only when the value actually moves.
   */
  const [tip, setTip] = useState<{ city: number; count: number } | null>(null);
  const tipShownRef = useRef<{ city: number; count: number } | null>(null);
  const tipCity = tip ? PROPERTIES[tip.city] : null;

  /**
   * Great-circle paths, sampled once — they are fixed in world space.
   *
   * Indexed `[stop][origin]`: every person can send to every city on the tour, and which
   * eight actually do it at a given stop is decided per frame. 13 x 13 curves of 48
   * points is ~8k coordinates built once at mount, which is cheaper than rebuilding a
   * dozen of them every time the tour advances.
   */
  const paths = useMemo(
    () =>
      TOUR.map((cityIdx) => {
        const to = PROPERTIES[cityIdx].location;
        // `greatCircle`, not `arcPath`, now the map is a sphere again. `arcPath` bows the
        // route deliberately, which a FLAT map needs — there the true shortest route
        // projects to very nearly a straight line, and a dozen of them converging on one
        // building read as a bundle of ties rather than as journeys. On a globe the great
        // circle is already a curve on screen, and bowing it further would draw a route no
        // aircraft flies.
        //
        // 96 samples, up from the default 48: a long arc spans most of the sphere and 48
        // segments across that shows as visibly faceted. The cost is one-off — this whole
        // table is built at mount.
        return ORIGINS.map((o) =>
          greatCircle([o.location[1], o.location[0]] as LngLat, [to[1], to[0]] as LngLat, 96),
        );
      }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    let map: any = null;

    const still =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Touch devices get a non-interactive globe. A one-finger drag on an
    // interactive Mapbox canvas rotates the globe instead of scrolling the page,
    // which traps the reader inside the hero.
    const touch =
      typeof window.matchMedia === "function" && window.matchMedia("(hover: none)").matches;

    loadMapbox().then((ok) => {
      if (cancelled) return;
      if (!ok || !stageRef.current || !config.MAPBOX_ACCESS_TOKEN) {
        setFailed(true);
        onReady?.();
        return;
      }
      // mapboxgl.supported() is what the main app gates on; v3 needs WebGL2.
      if (typeof mapboxgl.supported === "function" && !mapboxgl.supported()) {
        setFailed(true);
        onReady?.();
        return;
      }

      // Kicked off before the map is created, so the decode overlaps Mapbox's own
      // style and tile fetches rather than queueing behind them.
      const facesReady = loadFaces();
      const destIconReady = loadDestIcon();

      mapboxgl.accessToken = config.MAPBOX_ACCESS_TOKEN;
      try {
        map = new mapboxgl.Map({
          container: stageRef.current,
          // Mapbox Standard — what GL JS v3 uses when no style is given, i.e. the
          // default theme. Named explicitly rather than omitted so it is pinned and
          // obvious, but this is the out-of-the-box look.
          style: "mapbox://styles/mapbox/standard",
          projection: PROJECTION,
          // No symbol cross-fade. Mapbox fades icons in over 300ms when placement changes,
          // which is right for labels appearing as you pan a map you are driving, and
          // wrong for a scripted tour: the destination moves to a new city once every
          // eight seconds and should be THERE when it arrives, not resolving out of
          // nothing.
          //
          // Worth knowing that this is now very nearly INERT, and why, so it is not
          // mistaken for a lever it is not. `fadeDuration` governs the opacity transition
          // Mapbox runs when a symbol's PLACEMENT changes, and nothing here re-places any
          // more: both symbol layers carry `icon-allow-overlap` and `icon-ignore-placement`,
          // so they are never decluttered, and neither source is ever rewritten. The
          // building's handover between cities is a feature-state change on a paint
          // property, which Mapbox does not transition at all — data-driven paint values
          // step. Raising this would not soften that handover; it would only affect the one
          // fade-in each layer gets when its tile first renders at page load.
          fadeDuration: 0,
          center: MAP_CENTRE,
          zoom: globeZoom(window.innerWidth) + zoomBoost,
          // Never take the page's scroll. A hero that swallows the wheel is a
          // hero the reader cannot get past.
          scrollZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          dragPan: !touch && !still,
          dragRotate: false,
          touchZoomRotate: false,
          interactive: !touch && !still,
          // No attribution control at all, by request. Mapbox's boolean option is the
          // only way to stop it being created — hiding it in CSS still leaves a focusable
          // button in the tab order. See the ⚠️ note in DemandGlobe.module.scss: this
          // needs settling with Mapbox before production.
          attributionControl: false,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("[DemandGlobe] Mapbox failed to start — falling back.", error);
        setFailed(true);
        onReady?.();
        return;
      }
      mapRef.current = map;

      // ⚠️ NO ATTRIBUTION IS RENDERED. The compact "ⓘ → © Mapbox © OpenStreetMap"
      // toggle that used to be added here was removed by request. It was what satisfied
      // OpenStreetMap's ODbL requirement for the underlying data, so restoring it is one
      // line — see the attribution note in DemandGlobe.module.scss before shipping:
      //   map.addControl(new mapboxgl.AttributionControl({ compact: true }));

      map.on("error", (e: any) => {
        // A tile 403 (expired or domain-restricted token) leaves a blank sphere,
        // which is worse than the photo. Treat any style/auth failure as failure.
        const status = e?.error?.status;
        if (status === 401 || status === 403) {
          // eslint-disable-next-line no-console
          console.warn("[DemandGlobe] Mapbox rejected the token — falling back.", status);
          setFailed(true);
          onReady?.();
        }
      });

      // Started here rather than inside the load handler, so decoding overlaps Mapbox fetching its
      // style and first tiles instead of following them. By the time the handler needs the faces
      // they are almost always already in hand.

      map.on("load", async () => {
        if (cancelled) return;

        // ── The one deviation from stock Standard ──────────────────────────────
        // Standard's own place labels are switched off. This is a config toggle, not
        // a restyle — the theme's land, water, lighting, atmosphere and stars are all
        // untouched.
        //
        // It is necessary because Standard labels every country at this zoom and its
        // symbols are placed BEFORE ours, so with collision enabled our labels lost
        // and "London  412" never rendered at all; with collision disabled ours drew
        // but piled on top of each other across the UK cluster. Emptying the basemap
        // of labels leaves the collision index holding only our data labels, which
        // then declutter against each other properly — and it is what "don't show
        // every label at once" wanted anyway.
        //
        // To go fully stock, delete this block and accept one of those two failures.
        ["showPlaceLabels", "showPointOfInterestLabels", "showRoadLabels", "showTransitLabels"].forEach(
          (key) => {
            try {
              map.setConfigProperty("basemap", key, false);
            } catch (error) {
              // Older Standard revisions do not expose every toggle; a missing one is
              // not worth taking the hero down for.
            }
          },
        );

        // Space is replaced with page white, and the stars are switched off. This is
        // the only thing about Standard's *appearance* that changes: the earth keeps
        // the default theme's land, water, terrain shading and day lighting.
        //
        // Standard's own atmosphere paints deep navy space with a starfield, which in a
        // white hero reads as a black slab with a planet sitting in it rather than as a
        // globe on the page. The atmosphere is off entirely as well — see the note on
        // `high-color` below. The limb reads on its own: the sphere's edge is ocean, and
        // blue against white or against a photograph needs no help being found.
        try {
          map.setFog({
            // TRANSPARENT, not white. An opaque space makes the stage a solid rounded
            // card — invisible while the page behind it happens to be white, and an
            // obvious block the moment it is not. Transparent lets whatever the hero's
            // background is show through the corners, so the globe sits on the page
            // rather than on a panel of its own.
            "space-color": "rgba(255, 255, 255, 0)",
            "star-intensity": 0,
            // White, not the pale blue it was. That blue existed to give the limb an
            // edge back when the globe was a pale grey light-v11 sphere that otherwise
            // dissolved into a white page. Standard's earth is blue and green and needs
            // no help being read as round — and the blue glow had a cost: it reached the
            // stage's edges where the sphere comes closest to them, measured at
            // rgb(246,249,254) against a pure-white page, which read as the globe sitting
            // in a faintly tinted container.
            // NO atmosphere at all. Standard's `high-color` paints a rim just outside the
            // sphere, and `horizon-blend` is how wide that rim is; at 0.01 it was a thin
            // bright line hugging the limb. Invisible on a white page, which is where it
            // was tuned — but this globe now travels onto a photographic backdrop in
            // "Why partners", and there it read as a hard white halo drawn around the
            // planet. Fully transparent with zero blend, so the limb is the edge of the
            // sphere and nothing else.
            "high-color": "rgba(255, 255, 255, 0)",
            "horizon-blend": 0,
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn("[DemandGlobe] setFog unsupported on this style revision.", error);
        }

        // NOTHING else is restyled here, deliberately: this is the default theme, so the
        // atmosphere, lighting, land, water and basemap labels are all Standard's own.
        //
        // Worth knowing if that ever changes: Standard is a style *package*, not a
        // classic style, and its internal layers are not addressable. The
        // `setPaintProperty("land", …)` / `setPaintProperty("water", …)` calls that
        // corrected light-v11's inverted land-and-water values would simply fail
        // here, as would iterating `getStyle().layers` to hide the basemap's symbols.
        // Standard is configured through `setConfigProperty("basemap", …)` instead —
        // `lightPreset` (day/dawn/dusk/night), `showPlaceLabels`,
        // `showPointOfInterestLabels`, `show3dObjects` — which is the lever to reach
        // for rather than paint overrides.

        // Both pins have to exist before a layer names them.
        const pinRatio = Math.min(window.devicePixelRatio || 1, 2) * 2;
        // ONE destination sprite, and now only one destination on screen to use it.
        //
        // Still named through the features' `pin` property rather than a literal, so the
        // destination layer and the origin layer keep the same data-driven `icon-image`
        // expression and origins can stay one sprite per face.
        // ONE SPRITE, for every city. It was two while the destination was a photograph —
        // alternating rooms so consecutive stops differed — and one illustration serves
        // all thirteen, so the feature's `pin` now resolves to the same name every time.
        //
        // Awaited for the same reason the faces are: a layer naming an image that does not
        // exist yet draws nothing and only warns, so a slow decode would leave the
        // destination silently missing from the map.
        // Awaited before the layer names it: a layer whose `icon-image` does not resolve
        // draws nothing and warns nothing, so a slow decode would leave the destination
        // silently missing rather than glyph-less.
        const destIcon = await destIconReady;
        if (cancelled) return;
        if (!map.hasImage(DEST_SPRITE)) {
          const pin = makePin(destPinSpec(destIcon ? whiteMask(destIcon) : null), pinRatio);
          if (pin) map.addImage(DEST_SPRITE, pin as any, { pixelRatio: pinRatio });
        }

        // ONE SPRITE PER ORIGIN. They no longer differ by PHOTO — the set is four drawn
        // silhouettes now — but they still differ, so the layer keeps its data-driven
        // `icon-image` reading each feature's own `pin` rather than naming one image.
        //
        // Awaited before any layer is added: a layer naming an image that does not exist
        // yet draws nothing and only warns, so the pins would silently be missing on a
        // slow decode. `await` inside this handler is safe — everything after it is
        // sequential anyway.
        // Awaited before any layer is added: a layer naming an image that does not exist
        // yet draws nothing and only warns, so the pins would silently be missing on a
        // slow decode. `await` inside this handler is safe — everything after it is
        // sequential anyway.
        const faces = await facesReady;
        if (cancelled) return;
        ORIGINS.forEach((_origin, i) => {
          const faceId = `${ORIGIN_SPRITE}-${i}`;
          if (map.hasImage(faceId)) return;
          const badge = makeBadge(faces[i % faces.length], pinRatio);
          if (badge) map.addImage(faceId, badge as any, { pixelRatio: pinRatio });
        });

        // No `lineMetrics`: it existed only to supply `line-progress` to the
        // colour gradient, and the lines are a flat blue now.
        map.addSource("arcs", { type: "geojson", data: empty as any });
        // ── WRITTEN ONCE, AND NEVER AGAIN ───────────────────────────────────
        // The origins never move: twenty-six fixed points, one per source country. Only
        // how LIT they are changes, and that is feature state now (`glow`, `send`,
        // `muted`), read by the two layers over this source.
        //
        // It used to be rewritten with `setData` on every frame to carry those three
        // numbers, which was measured at 37 calls a second. Each one is a postMessage to a
        // Mapbox worker, a re-tile, a bucket rebuild and a buffer re-upload — and the
        // workers that do it are the SAME ones that parse the basemap's vector tiles. That
        // is what left the map showing raw style background: at this zoom the world is
        // about two tiles across, so one tile arriving late is a quarter of the world
        // rendered as a flat beige block, right where the camera had just flown.
        //
        // ⚠️  Do not add an animated value to these properties. If a layer needs to read
        // something that changes per frame, it reads it from `feature-state` and the loop
        // sets it with `setFeatureState` — which uploads a paint attribute and does not
        // re-tile anything. `pin` and `label` are here because they are constant.
        map.addSource("origins", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: ORIGINS.map((o, i) => ({
              type: "Feature",
              id: i,
              // `pin` names this origin's own sprite — see the note where they are registered.
              properties: { label: o.label, pin: `${ORIGIN_SPRITE}-${i}` },
              geometry: { type: "Point", coordinates: [o.location[1], o.location[0]] },
            })),
          } as any,
        });
        // ── ALL THIRTEEN CITIES, WRITTEN ONCE, NEVER AGAIN ──────────────────
        //
        // The tour shows ONE building at a time, so the obvious shape is a source holding
        // just that one, rewritten as the tour moves. That was the previous shape and it
        // cost the building a visible gap at every city change: a `setData` on a symbol
        // source re-runs Mapbox's symbol placement, placement is DEFERRED while the camera
        // animates, and the rewrite lands at exactly the moment the camera starts flying.
        // Measured at up to a second of missing building per stop, 6% of all frames.
        //
        // So every city is in the source from the start and the tour switches which one is
        // VISIBLE through `icon-opacity` — a paint property, which unlike `icon-size` can
        // read feature state, and which changes nothing about placement. The twelve
        // inactive buildings are placed and drawn at zero opacity; a symbol at zero opacity
        // costs a quad, and buying thirteen of those outright is how the source becomes
        // immutable.
        //
        // ⚠️  Nothing may rewrite this source. If a future stop needs different data, put it
        // in feature state, or in a property that is the same for every stop.
        map.addSource("dests", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: PROPERTIES.map((c, i) => ({
              type: "Feature",
              id: i,
              // CONSTANTS ONLY. Everything the tour animates is feature state.
              properties: {
                idx: i,
                name: c.label,
                count: c.enquiries,
                // Mapbox's symbol collision engine decides which labels survive, but
                // `symbol-sort-key` decides who wins — busiest city first. Vestigial now
                // that collision is off on this layer, and kept because the layer still
                // names it.
                sort: 10 - c.weight,
                // ⚠️ `icon-image` reads this. A data-driven `icon-image` that resolves to
                // null draws nothing and logs nothing, so omitting it empties the map of
                // destinations silently. This happened once with the origins.
                pin: DEST_SPRITE,
              },
              geometry: { type: "Point", coordinates: [c.location[1], c.location[0]] },
            })),
          } as any,
        });

        // Arcs go underneath the nodes so a line never covers the thing it lands on.
        map.addLayer({
          id: "arcs-glow",
          // Standard orders custom layers by slot; "top" puts the network above
          // the basemap and its own labels.
          slot: "top",
          type: "line",
          source: "arcs",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            // A wide, faint line UNDER the crisp one, so an arc reads as light travelling
            // rather than as a drawn stroke. Two layers over one source, not a second source:
            // the glow has to follow exactly the same geometry and the same launch state, and
            // sharing the source is what guarantees it cannot drift out of step.
            //
            // Added BEFORE the crisp layer so it paints beneath it — Mapbox draws in insertion
            // order within a slot.
            "line-width": [
              "*",
              ["interpolate", ["linear"], ["get", "head"], 0, 5, 1, 9],
              ["case", [">", ["get", "alpha"], 0.99], 1.3, 1],
              symbolScale,
            ],
            // A quarter of the crisp line's opacity. Any more and the glow reads as a second,
            // blurry arc; any less and it does nothing at all.
            "line-opacity": ["*", ["get", "alpha"], 0.22],
            "line-blur": 5 * symbolScale,
            "line-color": NETWORK_BLUE,
          },
        });

        map.addLayer({
          id: "arcs",
          slot: "top",
          type: "line",
          source: "arcs",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            // Interpolated along the line by `line-progress`, which is why the
            // source features carry `lineMetrics`.
            "line-width": [
              "*",
              ["interpolate", ["linear"], ["get", "head"], 0, 1.6, 1, 2.6],
              ["case", [">", ["get", "alpha"], 0.99], 1.4, 1],
              symbolScale,
            ],
            "line-opacity": ["get", "alpha"],
            "line-color": NETWORK_BLUE,
          },
        });

        // The wave a person throws off at the moment they send.
        //
        // Added BEFORE the origin symbols so it paints UNDER them — the ring expands out
        // from behind the face rather than over it. It is the same figure as the
        // destination's arrival pulse, run the other way: that one starts wide and
        // collapses onto the pin as demand lands, this one starts at the pin and opens
        // out as demand leaves. A reader who watches one stop sees demand leave a person
        // and arrive at a building, twice stated.
        map.addLayer({
          id: "origin-waves",
          slot: "top",
          type: "circle",
          source: "origins",
          paint: {
            // Scaled with the TRAVELLER, which is what it is now a ring around: the wave
            // opens from the point the face departs, so it has to start at the edge of
            // that face and grow from there. Left at a size of its own it opened from
            // well outside the only mark at that end, and stopped reading as coming off
            // anything.
            // ── `feature-state`, NOT `get` ──────────────────────────────────
            // `send` is the fastest-moving number on the map, and reading it from the
            // feature's PROPERTIES meant rewriting this source every frame to change it.
            // See the note on the `origins` source: a `setData` is a worker round-trip and
            // a bucket rebuild, and doing 37 of them a second is what starved the basemap
            // of tiles. Feature state is a paint-attribute upload with no re-tile, so the
            // wave animates at no cost to the map underneath it.
            //
            // `coalesce` to 0 is the RESTING value, deliberately: an origin with no state
            // yet is one that is not sending, which is exactly what 0 draws.
            "circle-radius": [
              "*",
              [
                "interpolate",
                ["linear"],
                ["coalesce", ["feature-state", "send"], 0],
                0,
                7,
                1,
                30,
              ],
              ORIGIN_ICON_SCALE,
              symbolScale,
            ],
            "circle-color": "rgba(0,0,0,0)",
            "circle-stroke-width": 1.4 * ORIGIN_ICON_SCALE * symbolScale,
            "circle-stroke-color": NETWORK_BLUE,
            // Fades as it widens, and is nothing at either end: a ring at full opacity
            // when it is still the size of the pin reads as a badge outline, and one that
            // survives to full width leaves a hoop sitting on the map.
            "circle-stroke-opacity": [
              "*",
              [
                "interpolate",
                ["linear"],
                ["coalesce", ["feature-state", "send"], 0],
                0,
                0,
                0.25,
                0.6,
                1,
                0,
              ],
              0.9,
            ],
          },
        });

        // The origins: one face per source country, standing still.
        //
        // They rode the arcs for a while — a face at the head of each comet, no pin left
        // behind — and it is worth writing down why that came back. A moving face is a
        // second thing to track in a frame that already has an arc growing, a counter
        // ticking and a building opening; and a country that is not currently sending
        // vanished from the map entirely, so the picture of WHERE demand comes from only
        // existed a few frames at a time. A pin that stays says it continuously.
        map.addLayer({
          id: "origins",
          type: "symbol",
          source: "origins",
          // Standard orders custom layers by slot; "top" puts the network above the
          // basemap and its own labels.
          slot: "top",
          layout: {
            // Data-driven: every origin has its own sprite, because every origin has its
            // own face.
            "icon-image": ["get", "pin"],
            // Centre, not bottom. These are circular badges — there is no tip to put on
            // the coordinate, so the coordinate goes in the middle of the circle.
            "icon-anchor": "center",
            // ── A CONSTANT. It used to grow 12% while the origin was sending ────
            //
            // ⚠️  DO NOT make this data-driven again without reading this. `icon-size` is a
            // LAYOUT property, and layout properties support neither `feature-state` nor
            // anything else that can change without the source being rewritten. Mapbox does
            // not throw on a `feature-state` layout expression either — it emits on
            // `map.on("error")` and then SILENTLY DECLINES TO ADD THE LAYER, so the symptom
            // is the avatars being wholly absent with no exception anywhere. Verified:
            //   layers.origins.layout.icon-size: "feature-state" data expressions
            //   are not supported with layout properties.
            //
            // So the only way to animate a size here is `setData` on this source every
            // frame, and that is precisely what starved the basemap of tiles and made this
            // map glitch (see the long note on the source). A 12% grow is not worth a
            // worker round-trip a frame.
            //
            // Nothing is lost from the story: a sending origin still brightens (icon-opacity
            // below, feature state, continuous) and still throws the expanding ring
            // (`origin-waves`, feature state, continuous). The grow was the third statement
            // of the same event.
            "icon-size": ORIGIN_ICON_SCALE * symbolScale,
            // Always drawn — an origin that Mapbox decluttered away would silently drop a
            // country out of the story.
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          },
          paint: {
            "icon-opacity": [
              "*",
              [
                "interpolate",
                ["linear"],
                ["coalesce", ["feature-state", "glow"], 0],
                0,
                0.78,
                1,
                1,
              ],
              [
                "case",
                ["==", ["coalesce", ["feature-state", "muted"], 0], 1],
                0.3,
                1,
              ],
            ],
          },
        });

        map.addLayer({
          id: "dests",
          type: "symbol",
          source: "dests",
          // Standard orders custom layers by slot; "top" puts the network above
          // the basemap and its own labels.
          slot: "top",
          layout: {
            "icon-image": ["get", "pin"],
            // BOTTOM, and offset DOWN so the pin's TIP lands on the city — which is what
            // makes this behave like a map pin rather than a picture parked near a place.
            //
            // The arithmetic, because it is not guessable from the sprite: `makePin` draws
            // into a canvas padded by `DEST_PIN.pad` on every side and puts the tip at
            // `h - 1.5` inside that padding, so the tip sits `pad + 1.5` above the image's
            // bottom edge. Anchoring bottom therefore leaves the tip that far ABOVE the
            // coordinate, and the offset pushes it back down. Mapbox multiplies
            // `icon-offset` by `icon-size`, so it tracks the pin's scale on its own.
            "icon-anchor": "bottom",
            "icon-offset": [0, DEST_PIN.pad + 1.5],
            // Scaled by a per-feature `boost` so the "destinations" step can enlarge the
            // pins. Turning every label on was not enough on its own: labels are also
            // gated by Mapbox's symbol collision, so most stay dropped however high their
            // opacity is, and the step read almost identically to the others.
            // A FIXED large size, not one interpolated off the city's weight. Weight
            // ranked eighteen pins against each other and there is only one now — the pin
            // is the subject of the frame, so it is drawn at the size the subject wants
            // and `open` animates it in.
            // ── A CONSTANT. It used to settle from 0.86 to full over 380ms ──────
            //
            // ⚠️  Same trap as the origins' `icon-size` directly above, and the same
            // verification — `feature-state` in a layout property is rejected and the LAYER
            // IS SILENTLY NOT ADDED, so the building disappears entirely with nothing
            // thrown. Animating a size here therefore costs a `setData` per frame on a
            // SYMBOL source, which re-runs placement, and placement is deferred while the
            // camera animates: that is the original "building missing for the first two to
            // three seconds of every stop" bug, and the settle ran entirely inside the
            // camera flight, so it was paying that cost at the worst possible moment.
            //
            // The arrival is still staged, just not by scale: the building appears at the
            // new city at full size and the camera flies to meet it, the pulse ring lands on
            // it as demand arrives, and the label opens once the camera has settled. The 14%
            // grow was the least legible of the four, and it ran entirely inside the flight.
            "icon-size": DEST_ICON_SCALE * symbolScale,
            // ── DECLUTTERING, WITHDRAWN ────────────────────────────────────────
            // These were `false`, so that Mapbox could thin the pins out by
            // `symbol-sort-key`. That was the right call against eighteen simultaneous
            // badges — seven of them landed inside a ~90px patch of Europe, and identical
            // discs stacked on identical discs read as one broken mark rather than as a
            // cluster.
            //
            // The tour removed the problem: there is one destination on the globe at a
            // time, with nothing to collide with but its own label. Leaving the collision
            // on would mean the single subject of the frame could still be dropped — the
            // one failure this graphic cannot survive.
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "symbol-sort-key": ["get", "sort"],
          },
          paint: {
            // ── `on` IS WHAT MAKES THIS THE TOUR'S CURRENT CITY ─────────────
            // Every city is in the source (see the note there), so this is the only thing
            // separating the one being visited from the twelve that are not. It defaults to
            // 0 — no city is current until the frame loop says so, which is the correct
            // reading of "no state yet" and means a stray feature can never appear.
            //
            // `icon-opacity` is PAINT, so feature state works here. `icon-size` two blocks
            // up is LAYOUT and it does not; that asymmetry is the whole reason this layer is
            // built the way it is.
            "icon-opacity": [
              "*",
              ["coalesce", ["feature-state", "on"], 0],
              [
                "case",
                ["==", ["coalesce", ["feature-state", "muted"], 0], 1],
                0.45,
                1,
              ],
            ],
          },
        });
        map.addLayer({
          id: "dests-pulse",
          // Standard orders custom layers by slot; "top" puts the network above
          // the basemap and its own labels.
          slot: "top",
          type: "circle",
          source: "dests",
          paint: {
            "circle-radius": [
              "*",
              [
                "interpolate",
                ["linear"],
                ["coalesce", ["feature-state", "pulse"], 0],
                0,
                22,
                1,
                6,
              ],
              symbolScale,
            ],
            "circle-color": "rgba(0,0,0,0)",
            "circle-stroke-width": 1.4 * symbolScale,
            "circle-stroke-color": NETWORK_BLUE,
            // 0 at rest, so a pulse with no state yet is simply not drawn.
            "circle-stroke-opacity": [
              "*",
              ["coalesce", ["feature-state", "pulse"], 0],
              0.55,
            ],
          },
        });

        // ── NO MAPBOX LABEL LAYER ──────────────────────────────────────────
        // There was one here: a `symbol` layer with a `text-field` of "<name>  <count>",
        // haloed white, decluttering against itself. It is gone because the tour draws
        // ONE destination, and what that one deserves is a proper tooltip — rounded,
        // translucent, blurred over the map behind it, and carrying a count that moves.
        //
        // None of which a Mapbox text layer can do: `text-halo` is the entire extent of
        // its background, there is no backdrop blur, and re-rendering a `text-field`
        // eight times a stop means rewriting the source to animate a number. So the label
        // is a DOM element positioned from `project()` instead — see `tipRef`.

        // NO HOVER HANDLERS ON THE DESTINATION. There were two, opening a per-city card
        // with its property count, fill rate, average booking and partner logos. The tour
        // took the reason for them away: the card existed so a reader could interrogate
        // one of eighteen small pins, and there is now one large building being narrated
        // by its own tooltip. A hover target that opens a second panel over the first is
        // two labels for one subject.
        // ── NO `resize` RE-ZOOM ─────────────────────────────────────────
        // There was one here: `map.setZoom(worldZoom(container.clientWidth))` on every
        // resize, because a mercator band's zoom IS its width and Mapbox has no reason to
        // touch it. A globe is fitted to its viewport by Mapbox itself, so re-zooming on
        // resize would take a correctly framed sphere and re-frame it. `trackResize` keeps
        // the canvas in step on its own.

        map.on("dragstart", () => {
          heldRef.current = true;
        });
        // No release here — the canvas' mouseleave owns that, so a drag that ends
        // with the cursor still on the globe leaves it held.
        map.on("dragend", () => {});

        const canvas = map.getCanvas();
        canvas.addEventListener("mouseleave", () => {
          heldRef.current = false;
        });

        startRef.current = Date.now();

        onReady?.();

        const frame = () => {
          const now = Date.now();
          // ── The hold pauses the TOUR, not just the camera ────────────────
          //
          // A drag stops the camera being flown. If the clock kept running underneath that,
          // the stops would keep advancing over a map that is no longer following them —
          // which is exactly the desync described on the `dragstart` handler above. So held
          // wall-clock time is accumulated here and subtracted out, and `elapsed` becomes
          // TOUR time rather than page time: while the reader is dragging, the tour is
          // genuinely paused, and it resumes from where they left it instead of jumping to
          // wherever it would have got to.
          //
          // Measured off the frame delta rather than from the event handlers, so there is no
          // start/stop bookkeeping to get wrong and no way for a missed event to leave the
          // clock permanently offset. A backgrounded tab hands back one enormous delta, and
          // that is CORRECT here: if the map was held the whole time, the whole time was
          // paused.
          const wall = lastFrameRef.current ? now - lastFrameRef.current : 0;
          lastFrameRef.current = now;
          if (heldRef.current) heldMsRef.current += wall;
          const elapsed = now - startRef.current - heldMsRef.current;
          // Focus modes, set by the stepped rail in "Your place is made for amber" so
          // each claim there changes what the sphere shows. Hover stays authoritative:
          // pointing at a city is an explicit gesture and should beat the section's
          // ambient state.
          const mode = focusRef.current;
          const dimDests = mode === "origins" || mode === "reach";
          const dimOrigins = mode === "destinations" || mode === "arcs";
          const allOriginsLit = mode === "reach";
          const arcsBoosted = mode === "arcs";
          const allDestLabels = mode === "destinations";

          // ── Where the tour is ────────────────────────────────────────────
          // Reduced motion gets stop 0 and never advances. The tour IS the animation, so
          // there is nothing to shorten: it simply is not played, and London is shown
          // with all of its arcs already drawn.
          const stop = still ? 0 : Math.floor(elapsed / STOP_MS) % TOUR.length;
          const stopT = still ? STOP_MS : elapsed % STOP_MS;
          const cityIdx = TOUR[stop];
          const city = PROPERTIES[cityIdx];
          // How long this hop takes, and therefore when the badge is allowed to open.
          const flight = still
            ? 0
            : flightMs(
                kmBetween(
                  PROPERTIES[TOUR[(stop - 1 + TOUR.length) % TOUR.length]].location,
                  city.location,
                ),
              );
          // ── `open` IS GONE ───────────────────────────────────────────────
          // It scaled the destination in over OPEN_MS. `icon-size` is a layout property and
          // cannot read anything that changes without a source rewrite, so the only way to
          // keep it was a per-frame `setData` on a symbol source — the thing that made the
          // building vanish in the first place. The arrival is carried by the pulse ring and
          // by `labelIn` instead. See the `icon-size` note on the `dests` layer for the full
          // reasoning.

          // The label waits for the camera.
          const labelIn = still
            ? 1
            : smoothstep(clamp01((stopT - flight * LABEL_FROM) / LABEL_MS));

          // ── Fly to the city, ONCE PER STOP ───────────────────────────────
          // Not per frame. Mapbox owns the easing here — `easeTo` interpolates its own
          // camera on its own clock, which is smoother than anything this loop can write
          // by hand and survives a dropped frame without stuttering. Driving `setCenter`
          // every frame instead fights Mapbox's own transform and reads as a judder.
          //
          // `offset` is what puts the city in the middle of what the reader can SEE rather
          // than the middle of the canvas. The map is a band whose bottom runs past the
          // fold, so the canvas centre is not on screen at all — and the gap between the
          // two is measured here, not assumed, because it changes with the viewport.
          if (!still && !heldRef.current && flownToRef.current !== stop) {
            const first = flownToRef.current === -1;
            flownToRef.current = stop;

            // ── MEASURED FROM THE SLOT, NOT THE CANVAS ──────────────────────
            //
            // ⚠️  This was `map.getContainer()` and it put the FIRST city ~35px low, every
            // load. The canvas lives in a fixed layer that `GlobeTravel` transforms, and the
            // hero entrance lifts that layer 70px and decays the lift over ~2s. The first
            // stop is a `jumpTo` fired at ~2.4s — inside that window — so it measured a rect
            // still in motion and pinned an offset to it. Measured: container top 346 at
            // London's jump against 416 once settled, giving offset -68 where every later
            // stop got -103. The offset is computed once per stop and never revisited, so
            // London stayed 35px below where Sydney and New York land.
            //
            // The SLOT is the fix rather than a delay or a re-issue: it is plain layout, it
            // never moves during the entrance, and the layer's whole job is to come to rest
            // exactly over it — so the slot's rect IS the settled canvas rect, available
            // before the canvas has finished getting there.
            //
            // Falls back to the container if the slot is absent, which is the pre-existing
            // behaviour and still correct once the entrance has settled.
            const slot = document.querySelector<HTMLElement>('[data-globe-slot="hero"]');
            const rect = (slot ?? map.getContainer()).getBoundingClientRect();

            // ⚠️  THE CANVAS'S HEIGHT IS ITS WIDTH, NOT THE SLOT'S HEIGHT, and mixing the two put
            // every focused city below the fold.
            //
            // Mapbox's `offset` is measured from the CANVAS's centre. This used `rect.height / 2`,
            // which was correct only while the slot and the canvas were the same box — both 1224px
            // squares. The slot's reserved height is now `SCROLL_SHRINK_TO` of its width (see
            // `.globeSlot` in Hero.module.scss, and the note there for why), so the slot is half the
            // canvas's height while the layer is still square.
            //
            // With `rect.height` the offset came out -52 instead of -358, which landed the focused
            // city at y 952 in a 900px viewport — the pin and its tooltip sat just past the fold.
            // Deriving the canvas's height from the slot's WIDTH restores it exactly: the layer is
            // sized `slot.width * HERO_ZOOM` and is square (`MAP_ASPECT` is 1), so its height is its
            // width, and its top is anchored to the slot's top.
            //
            // The VISIBLE STRIP is measured on the canvas too, not the slot: the globe is drawn in
            // the canvas, so where the reader can see it is a fact about the canvas's box.
            const canvasTop = rect.top;
            const canvasHeight = rect.width;
            const visibleTop = Math.max(0, canvasTop);
            const visibleBottom = Math.min(window.innerHeight, canvasTop + canvasHeight);
            const offsetY = (visibleTop + visibleBottom) / 2 - (canvasTop + canvasHeight / 2);

            const target: [number, number] = [city.location[1], city.location[0]];
            if (first) {
              // The page opens ON its first city rather than flying to it from wherever
              // MAP_CENTRE happens to be — that would be an entrance the reader has no
              // context to read, before they have seen a single stop.
              //
              // ⚠️  `easeTo` WITH `duration: 0`, NOT `jumpTo`, and this is the whole reason the
              // first city used to sit ~100px below every other one.
              //
              // `offset` is not a camera option in Mapbox — it lives in `AnimationOptions`,
              // which `easeTo` and `flyTo` read and `jumpTo` does not. So `jumpTo({center,
              // offset})` silently drops the offset: no error, no warning, the option simply
              // is not part of that method's contract. London therefore landed at the CANVAS
              // centre while Sydney and New York landed at the centre of the VISIBLE strip,
              // and the canvas runs ~110px past the fold.
              //
              // A zero-duration ease is the same instant jump and does honour it.
              map.easeTo({ center: target, offset: [0, offsetY], duration: 0 });
            } else {
              map.easeTo({
                center: target,
                offset: [0, offsetY],
                duration: flight,
                easing: easeInOutCubic,
                essential: true,
              });
            }
          }

          const features: any[] = [];
          const pulses = PROPERTIES.map(() => 0);
          /** How lit each origin is: up as it sends, down again as its demand lands. */
          const glows = ORIGINS.map(() => 0);
          /** How far through its send each origin is — drives the wave it throws off. */
          const sends = ORIGINS.map(() => 0);

          const senders = sendersFor(stop);
          const sendGap = (SEND_TO_MS - SEND_FROM_MS) / Math.max(1, senders.length - 1);

          senders.forEach((originIdx, k) => {
            const phase = still
              ? STILL_PHASE
              : phaseAt(stopT - (SEND_FROM_MS + k * sendGap));
            const { active, head, tail, landed } = phase;
            if (!active) return;

            glows[originIdx] = Math.max(glows[originIdx], still ? 1 : originGlow(head));
            // The wave is thrown at the MOMENT of sending and does not follow the arc,
            // so it is driven by the first sliver of `head` rather than by the whole of
            // it — a ring that expanded for the full 2.8s flight read as a target being
            // acquired rather than as something leaving.
            sends[originIdx] = Math.max(sends[originIdx], still ? 0 : clamp01(head / 0.22));

            if (!still && landed > 0) {
              pulses[cityIdx] = Math.max(pulses[cityIdx], 1 - landed);
              if (landed < 0.15) arrivedRef.current[cityIdx] = now;
            }

            const coords = slicePath(paths[stop][originIdx], tail, head);
            if (coords.length < 2) return;
            features.push({
              type: "Feature",
              properties: {
                head,
                alpha: arcsBoosted ? 1 : dimDests || dimOrigins ? 0.42 : 0.95,
              },
              geometry: { type: "LineString", coordinates: coords },
            });

          });

          // ── The arcs: the only `setData` left, and it is rate-limited ────
          //
          // Their geometry is the animation — a comet with a moving tail as well as a
          // moving head — so there is nothing to move to a paint property. What there is,
          // is a budget: see ARC_WRITE_MS. Slower while the camera flies, because that is
          // when the basemap needs the same workers and when losing the race shows as a
          // beige block.
          const arcBudget = map.isMoving() ? ARC_WRITE_MS_FLYING : ARC_WRITE_MS;
          const arcSrc =
            now - arcWroteAtRef.current >= arcBudget ? map.getSource("arcs") : null;
          if (arcSrc) {
            arcWroteAtRef.current = now;
            arcSrc.setData({ type: "FeatureCollection", features } as any);
          }

          // ── The destination handover: ONE feature-state write per stop ──
          //
          // ⚠️  This used to run `setData` on every frame, and that is what made the
          // building disappear. Rewriting a symbol source re-runs Mapbox's symbol
          // PLACEMENT, and placement is deferred while the camera is animating — so a
          // source rewritten sixty times a second during a two-and-a-half second flight
          // never finished placing its one icon, and the destination was simply absent for
          // the first two to three seconds of every stop. Measured, not guessed:
          // `queryRenderedFeatures` at the city returned 0 features that whole time while
          // the feature's own `open` sat at 1.
          //
          // Two fixes were not enough. Gating the rewrite on a signature still fired about
          // twelve times a second, because `open` and `pulse` both ease continuously.
          // Cutting it to one rewrite per CITY still cost a gap at every stop — that single
          // rewrite lands exactly as the camera starts flying, which is the worst possible
          // moment for a placement pass, and it measured at 6% of all frames with no
          // building on the map.
          //
          // So the source is never rewritten at all (see the note where it is created) and
          // the tour hands the building over instead: `on` goes off the old city and onto
          // the new one. No re-tile, no placement pass, no gap.
          if (cityIdx !== destCityRef.current) {
            if (destCityRef.current >= 0) {
              // The outgoing city's pulse is cleared with it. A stop can end mid-arrival,
              // and a ring left frozen at half-expanded would sit on a city the tour has
              // already left — invisible only because its icon is, until the tour comes back
              // round to it.
              map.setFeatureState(
                { source: "dests", id: destCityRef.current },
                { on: 0, pulse: 0 },
              );
            }
            destCityRef.current = cityIdx;
            // Cleared so the push below cannot decide there is nothing to do: the incoming
            // city needs `on` set THIS frame, not whenever its pulse happens to change.
            destStateRef.current = "";
          }

          // ── Everything that animates within a stop: feature state ───────
          //
          // A `setFeatureState` uploads a paint attribute. It does not postMessage to a
          // worker, does not re-tile, and does not re-run symbol placement — which is the
          // whole reason both point sources are now immutable. Skipped when the quantised
          // value has not moved, so a parked stop costs nothing at all.
          //
          // `open` is deliberately NOT pushed. It drove `icon-size`, which is a layout
          // property and therefore cannot read feature state at all — see the note on that
          // property. It still gates nothing else, so pushing it would be state no layer
          // can read.
          const destState = `${q(pulses[cityIdx])}`;
          if (destState !== destStateRef.current) {
            destStateRef.current = destState;
            map.setFeatureState(
              { source: "dests", id: cityIdx },
              { on: 1, pulse: pulses[cityIdx], muted: 0 },
            );
          }

          ORIGINS.forEach((_o, i) => {
            // `allOriginsLit` overrides `glows[i]`, so the SETTLED value goes into the
            // signature — not the raw one. Comparing the raw glow would let the "reach"
            // step turn every origin on without any of them noticing they had changed.
            const glow = allOriginsLit ? 1 : glows[i];
            const muted = dimOrigins ? 1 : 0;
            const state = `${q(glow)}|${q(sends[i])}|${muted}`;
            if (state === originStateRef.current[i]) return;
            originStateRef.current[i] = state;
            map.setFeatureState(
              { source: "origins", id: i },
              {
                glow,
                // Every person on the globe is sending to the one city on screen, so
                // there is no longer such a thing as an origin unrelated to the rest.
                muted,
                send: sends[i],
              },
            );
          });
          // ── The arrivals counter ─────────────────────────────────────────
          // Counted off the SCHEDULE, not off the arcs still being drawn. An arc that has
          // landed stops being active and disappears from `senders`' phases a moment
          // later, so counting live arcs would tick the number back down again.
          //
          // The count ends the stop on the city's own printed figure and starts it 6%
          // below, so what the reader watches is the last few percent of that number
          // arriving — rather than a counter that runs from nothing, which would claim
          // the whole of a city's demand turned up in eight seconds.
          // 6% of BOOKINGS now, not of enquiries — the tooltip prints bookings, so the
          // figure that ticks has to be the one on screen. Floored at 6 so the smallest
          // markets still visibly move.
          const bump = Math.max(6, Math.round(city.bookings * 0.06));
          const landedCount = still
            ? senders.length
            : senders.filter(
                (_, k) => stopT >= SEND_FROM_MS + k * sendGap + ARC_MS * FLY,
              ).length;
          const count =
            city.bookings - bump + Math.round((bump * landedCount) / senders.length);
          const shown = tipShownRef.current;
          if (!shown || shown.city !== cityIdx || shown.count !== count) {
            tipShownRef.current = { city: cityIdx, count };
            setTip({ city: cityIdx, count });
          }

          // ── The tooltip, placed over the building ────────────────────────
          //
          // ── THE FAR-SIDE TEST IS BACK, because the map is a sphere again ──
          //
          // `project()` happily returns a screen point for a city on the BACK of the globe,
          // so without this the tooltip hangs over the wrong hemisphere — labelling a place
          // the reader cannot see, at a position that means nothing.
          //
          // ⚠️  It was correctly REMOVED while the map was a flat mercator band, and that is
          // worth knowing rather than re-deriving: on a whole-world flat frame the guard
          // rejects anything more than 90 degrees from centre, which is most of the Pacific
          // rim — cities plainly on screen. The test belongs to the projection, not to the
          // tooltip. If the map ever goes flat again, this goes with it.
          const tipEl = tipRef.current;
          const facing = isFacing(city.location[1], city.location[0], map.getCenter());
          if (tipEl && facing) {
            const pt = map.project([city.location[1], city.location[0]]);
            const scale = DEST_ICON_SCALE * symbolScale;
            // The pin's drawn height above its point, and the radius of its head — the two
            // things the tooltip has to place itself around. Both in the map's own pixels,
            // which is the space this overlay is positioned in, so the tooltip tracks the
            // pin at every icon scale without a second constant to keep in step.
            // What stands ABOVE the coordinate: the artwork down to its footing. The rest
            // of it — the front of the base, and the shadow — is below the city and does
            // not concern anything placed over it.
            // Off the PIN's own box now the destination is a teardrop rather than an
            // isometric building. `h - 1.5` is the drawn height above the tip (the tip being
            // the coordinate), and `r` is the head's radius — the two things a callout has to
            // place itself around.
            const pinH = (DEST_PIN.h - 1.5) * scale;
            const headR = DEST_PIN.r * scale;
            // Its own height, measured rather than assumed: the panel is two lines of text
            // and its height is whatever the font renders.
            const tipH = tipEl.offsetHeight;

            // ── ABOVE if it fits, BESIDE if it does not ─────────────────────
            // The map is a band whose height is a fraction of the window's WIDTH, while
            // the pin and this panel are fixed pixel sizes — so the narrower the window,
            // the shorter the band and the less room there is above a northern city.
            // Berlin and London sit near the top of it.
            //
            // Clamping the panel down into the band was the first attempt, and it was
            // worse than the problem: it stopped the tooltip leaving the map and parked it
            // squarely over the head of the pin it was labelling. Moving it to the pin's
            // side keeps both readable, which is what a callout does anyway when it runs
            // out of room above.
            const above = pt.y - pinH - 12;
            if (above - tipH >= 4) {
              tipEl.style.transform = `translate3d(${pt.x}px, ${above}px, 0) translate(-50%, -100%)`;
            } else {
              tipEl.style.transform = `translate3d(${pt.x + headR + 12}px, ${
                pt.y - pinH + headR
              }px, 0) translate(0, -50%)`;
            }
            tipEl.style.opacity = String(labelIn);
          } else if (tipEl) {
            // Hidden rather than left where it was: a tooltip frozen at its last position
            // while its city rotates behind the globe reads as a label for whatever is now
            // underneath it.
            tipEl.style.opacity = "0";
          }

          // Under reduced motion this renders exactly once. Leaving the loop
          // running would rewrite three identical sources sixty times a second
          // forever, and "frozen" would be a claim rather than a fact.
          if (!still) rafRef.current = window.requestAnimationFrame(frame);
        };
        frame();
      });
    });

    return () => {
      cancelled = true;
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [paths, onReady]);

  const fmt = (n: number) => n.toLocaleString("en-GB");

  return (
    <div ref={boxRef} className={styles.box}>
      {/* Warms the TLS connection to Mapbox during SSR, before any script has asked
          for it. This is not cosmetic: the hero's entrance is gated on the globe being
          drawable, and measured cold that took ~2.5s — most of which is connection
          setup plus a style fetch, not rendering. Shortening the real wait is better
          than papering over it with a longer animation delay. */}
      <Helmet>
        <link rel="preconnect" href="https://api.mapbox.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://api.mapbox.com" />
      </Helmet>
      {failed ? (
        <Image
          src={fallbackPhoto}
          alt="A property team working together around a table"
          className={styles.fallback}
          width="100%"
          height="100%"
          isEagerLoad
        />
      ) : (
        <div className={styles.stageWrap}>
          <div
            ref={stageRef}
            className={styles.stage}
            role="img"
            aria-label={`Rotating globe showing ${fmt(TOTALS.enquiries)} student enquiries arriving into amber\u2019s ${TOTALS.cities} cities across ${TOTALS.listedCountries} countries`}
          />

          {/* The tour tooltip. Rendered ALWAYS once the tour has a city, and shown or
              hidden by the frame loop writing `opacity` — mounting and unmounting it per
              stop would restart its backdrop filter and flash the map behind it.

              `aria-hidden`: every figure in it is already in the screen-reader paragraph
              at the foot of this component, and a counter that ticks eight times a stop
              would otherwise be announced eight times a stop. */}
          {tipCity ? (
            <div className={styles.tip} ref={tipRef} aria-hidden="true">
              <span className={styles.tipHead}>
                <img src={tipCity.flag} alt="" className={styles.tipFlag} />
                <b>{tipCity.label}</b>
                <span className={styles.tipCountry}>{tipCity.country}</span>
              </span>
              {/* BOOKINGS, not enquiries. The enquiries figure was here — and briefly both,
                  side by side — and one number is the right count for a tooltip this size:
                  two large figures in a 200px panel compete, and of the pair bookings is the
                  one a partner is deciding on. Enquiries are still in the screen-reader
                  paragraph below, and still what `TOTALS` sums.

                  This is the figure that COUNTS UP as the arcs land, which is why the count
                  moved with it — see `bump` in the frame loop. A static number under arcs
                  visibly arriving would say the arrivals change nothing. */}
              <span className={styles.tipStat}>
                <b>{fmt(tip ? tip.count : tipCity.bookings)}</b>
                <i>bookings</i>
              </span>
            </div>
          ) : null}
        </div>
      )}

      <p className={styles.srOnly}>
        amber lists student accommodation in {TOTALS.cities} cities across{" "}
        {TOTALS.listedCountries} countries:{" "}
        {/* `fmt`, matching the badge. The counts are four figures now, and "4182 enquiries"
            read out beside a badge showing "4,182" is the same number typeset two ways. */}
        {PROPERTIES.map((c) => `${c.label}, ${c.country} (${fmt(c.enquiries)} enquiries)`).join("; ")}.
        Demand arrives
        from {ORIGINS.map((o) => o.label).join(", ")} and beyond. Property partners listing on amber
        include {PARTNERS.map((p) => p.name).join(", ")}. Figures are illustrative.
      </p>
    </div>
  );
};

export default wrapperHOC(DemandGlobe, {
  componentName: "DemandGlobe-ListWithUs",
  showForChina: true,
});
