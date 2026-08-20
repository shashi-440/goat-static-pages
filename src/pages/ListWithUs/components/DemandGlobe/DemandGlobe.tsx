import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import config from "@Config/index";
import styles from "./DemandGlobe.module.scss";
import { ORIGINS, PARTNERS, PROPERTIES, ROUTES, TOTALS } from "../DemandMap/network";
import {
  LABEL_MS,
  SLOTS,
  STILL_PHASE,
  clamp01,
  originGlow,
  phaseFor,
} from "../DemandMap/schedule";
import { greatCircle, isFacing, LngLat, slicePath } from "./globeGeo";
import fallbackPhoto from "../../assets/hero-bg.jpg";

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
 * Zoom. 1.55 left the sphere ~510px across in a 620px-tall stage with a wide band
 * of empty page either side; 1.82 fills the stage's height. Going further crops the
 * limb, and the limb is what makes it read as a globe.
 */
const ZOOM = 1.82;

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
 * Destinations that keep their label permanently.
 *
 * Highest volume first, but skipping any city within MIN_ANCHOR_KM of one already
 * chosen. Taking the top four by volume outright — which is what the flat map does —
 * picks London and Manchester, and they are 262km apart: about 8px on this globe, so
 * the two labels sit on top of each other. Screen distance is no use for the test
 * because it changes as the camera sweeps, so the separation is measured on the
 * ground instead. This resolves to London, New York and Sydney, which is also a
 * pleasingly global set for the part of the map that is always readable.
 */
const MIN_ANCHOR_KM = 1200;

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

const TOP_LABELS = (() => {
  const picked: number[] = [];
  PROPERTIES.map((c, i) => ({ i, e: c.enquiries }))
    .sort((a, b) => b.e - a.e)
    .forEach(({ i }) => {
      if (picked.length >= 4) return;
      const clash = picked.some(
        (j) => kmBetween(PROPERTIES[j].location, PROPERTIES[i].location) < MIN_ANCHOR_KM,
      );
      if (!clash) picked.push(i);
    });
  return new Set(picked);
})();

const ROUTES_BY_ORIGIN = ORIGINS.map((_, i) => ROUTES.filter((r) => r.from === i));
const PARTNERS_BY_CITY = PROPERTIES.map((_, i) => PARTNERS.filter((p) => p.city === i));

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
 * Faces for the origin badges.
 *
 * Illustrated heads on a solid coloured disc — DiceBear `adventurer`. Head and hair only, no torso,
 * which is the difference from the `avataaars` set tried before it: on a 24px badge a bust means the
 * face gets a third of the circle, where a head fills it.
 *
 * ⚠️ LICENCE: `adventurer` is CC BY 4.0 (Lisa Wischofsky). Unlike the CC0 styles this needs a
 * visible credit somewhere before it ships. That is the cost of it being the closest match — the
 * head-only CC0 options are line art that vanishes at this size.
 *
 * ── Generated once and COMMITTED ────────────────────────────────────────────
 * Not fetched at runtime: thirteen requests to a third-party service per page load, to draw
 * decoration, and a globe that loses its badges whenever that service is slow. Seeded by country so
 * each origin has a stable character and regenerating reproduces exactly these faces.
 *
 * The coloured disc is BAKED INTO EACH FILE via `backgroundColor`, not drawn here. It is per-origin
 * artwork rather than a canvas step, so the badge drawing has one less layer to get wrong.
 *
 * ── The generator is CONSTRAINED, not left to chance ─────────────────────────
 * Every option was added because the unconstrained output shipped something wrong, and each was
 * found by rendering the full variant set and looking at it rather than by guessing:
 *
 *   · `eyes` — 26 variants; 07, 08 and 09 are wide alarmed eyes and a random thirteen drew several.
 *     Restricted to the calm and closed-happy ones.
 *   · `mouth` — 30 variants; 13 through 18 are shock and tongues-out. Restricted to smiles.
 *   · `hairColor` — the default palette is mostly grey, silver, blonde and red. Restricted to black
 *     through auburn, which is what these thirteen origins would plausibly look like.
 *   · `skinColor` — set PER ORIGIN, not by seed. Left to chance it came out overwhelmingly pale,
 *     including for Nigeria and Kenya. One tone per country is a simplification — countries are not
 *     monolithic — but a far smaller error than a mostly-white set standing in for these places.
 *   · `featuresProbability=0` — birthmarks and blush are noise at this size.
 *
 * The exact request, for regenerating:
 *   https://api.dicebear.com/9.x/adventurer/png?seed=amber-<Country>&size=96
 *     &eyes=variant01,03,04,06,11,12,13,14,15,20,22,23,24,26
 *     &mouth=variant01,04,05,09,11,21,22,23,25,26,27,28,29,30
 *     &hairColor=0e0e0e,562306,6a4e35,ac6511&featuresProbability=0
 *     &glassesProbability=20&earringsProbability=10
 *     &skinColor=<per-country>&backgroundColor=<per-country>
 *
 * 96px source for a 26px badge: the sprite is drawn at ratio 4, so 96 is roughly 1:1 at the largest
 * ratio this renders at. 104KB for the set.
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
 * Decode the avatar set, resolving to one element per face and `null` for any that fail.
 *
 * `decode()` rather than the `load` event where it exists: it resolves once the bitmap is actually
 * ready to paint, and an image that has fired `load` can still cost a synchronous decode on first
 * draw — which would be thirteen of them in a row inside the map's load handler.
 *
 * Never rejects. One unreachable file should cost that badge its face, not cost the map its pins.
 */
const loadFaces = (): Promise<Array<HTMLImageElement | null>> =>
  Promise.all(
    FACES.map(
      (src) =>
        new Promise<HTMLImageElement | null>((resolve) => {
          // `document.createElement`, not `new Image()`: this module imports the project's own
          // `Image` React component, which shadows the DOM constructor entirely.
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
 * The destination glyph: amber's own `Building office` icon.
 *
 * ONE glyph for all eighteen cities. Four attempts got here and each failed differently, which is
 * worth keeping so none of them is tried again:
 *
 *   · FOUR BUILDING SILHOUETTES, picked per city by index. The variety carried no information —
 *     a city got a tower because its index was odd, not because it has towers — while looking
 *     exactly like it did, and four distinct marks read as four CATEGORIES of pin.
 *   · A HAND-DRAWN BED. A bed traced as a flat side profile reads as a bench at this size,
 *     because what identifies a bed is the pillow-and-occupant relationship, not the frame.
 *   · MAKI'S `lodging`, which draws exactly that relationship — a head on a pillow, a body under
 *     a blanket. Correct for a hotel, wrong here: a figure lying in a bed reads as a HOSPITAL.
 *   · MAKI'S `home`, a pitched-roof house. Legible, and generic — it is the icon every map uses
 *     for a dwelling, so it said "a building is here" and nothing about student accommodation.
 *
 * This one is amber's, from the product's own icon set, which is the reason to prefer it over
 * anything off the shelf: the pins on the globe are now drawn in the same hand as the icons the
 * rest of the site uses.
 *
 * Source: `../../assets/icons/building-office.svg`, kept in the repo beside the path string
 * inlined below. It is inlined rather than imported because the badge is drawn on a CANVAS — a
 * canvas needs geometry, not an image URL, and rasterising an <img> to get it back would cost a
 * decode per sprite for the same pixels.
 *
 * Its viewBox is 24x24, NOT the 15x15 the earlier glyphs used, and the badge scales from that —
 * see the divisor in `makeDestBadge`. Getting that wrong draws the icon at the wrong size.
 *
 * ⚠️ Filled EVENODD, which is a reversal from the last two glyphs. The source sets
 * `fill-rule="evenodd"` and it needs it: the windows are subpaths INSIDE the building outline and
 * the rule is what knocks them through. Filled nonzero they fill solid and the building loses
 * every window it has.
 *
 * ⚠️ The literal is split ONLY at command letters (M, C, L, Z ...). Wrapping it anywhere else can
 * land inside a number — "0.13807" became "0.13 807" once — and `Path2D` does not throw on
 * malformed data, it stops where it stopped. The symptom was a badge with a 3px white speck in
 * it, which looks like a scaling bug and is not one.
 */
const OFFICE_PATH =
  "M10.06 19.795C9.89431 19.795 9.76 19.6606 9.76 19.495V17.145" +
  "C9.76 16.685 10.15 16.295 10.61 16.295H13.39C13.86 16.295 14.24 16.685 14.24 17.145V19.495" +
  "C14.24 19.6606 14.1057 19.795 13.94 19.795H10.06ZM10.48 7.08496" +
  "C10.43 7.09496 10.38 7.09496 10.33 7.09496C9.98 7.09496 9.66 6.85496 9.59 6.49496" +
  "C9.51 6.08496 9.77 5.68496 10.18 5.60496C10.5884 5.52527 10.9769 5.7829 11.059 6.19008" +
  "C11.0597 6.1933 11.06 6.19661 11.06 6.1999C11.06 6.20326 11.0603 6.20664 11.061 6.20994" +
  "C11.1378 6.60828 10.8783 7.00529 10.48 7.08496ZM11.059 12.8501" +
  "C11.0597 12.8533 11.06 12.8566 11.06 12.8599C11.06 12.8633 11.0603 12.8666 11.061 12.8699" +
  "C11.1378 13.2683 10.8783 13.6653 10.48 13.745C10.43 13.755 10.38 13.755 10.33 13.755" +
  "C9.98 13.755 9.66 13.515 9.59 13.155C9.51 12.745 9.77 12.345 10.18 12.265" +
  "C10.5884 12.1853 10.9769 12.4429 11.059 12.8501ZM10.47 10.445" +
  "C10.42 10.455 10.37 10.455 10.33 10.455C9.97 10.455 9.66 10.205 9.59 9.84496" +
  "C9.51 9.44496 9.78 9.04496 10.19 8.96496C10.5983 8.88529 10.9768 9.15272 11.059 9.54997" +
  "C11.0597 9.55327 11.06 9.55665 11.06 9.56002C11.06 9.5633 11.0603 9.56661 11.0609 9.56983" +
  "C11.1379 9.97805 10.8684 10.3653 10.47 10.445ZM13.82 7.08496" +
  "C13.77 7.09496 13.72 7.09496 13.67 7.09496C13.32 7.09496 13.01 6.85496 12.94 6.49496" +
  "C12.86 6.08496 13.12 5.68496 13.53 5.60496C13.9284 5.52527 14.3268 5.7829 14.409 6.19008" +
  "C14.4097 6.1933 14.41 6.19661 14.41 6.1999C14.41 6.20326 14.4103 6.20664 14.411 6.20994" +
  "C14.4878 6.60828 14.2283 7.00529 13.82 7.08496ZM14.409 12.8501" +
  "C14.4097 12.8533 14.41 12.8566 14.41 12.8599C14.41 12.8633 14.4103 12.8666 14.411 12.8699" +
  "C14.4878 13.2683 14.2283 13.6653 13.82 13.745C13.77 13.755 13.72 13.755 13.67 13.755" +
  "C13.32 13.755 13.01 13.515 12.94 13.155C12.86 12.745 13.12 12.345 13.53 12.265" +
  "C13.9284 12.1853 14.3268 12.4429 14.409 12.8501ZM13.82 10.445" +
  "C13.77 10.455 13.72 10.455 13.67 10.455C13.32 10.455 13.01 10.205 12.94 9.84496" +
  "C12.86 9.44496 13.13 9.04496 13.53 8.96496C13.9483 8.88529 14.3268 9.15272 14.409 9.54997" +
  "C14.4097 9.55327 14.41 9.55665 14.41 9.56002C14.41 9.5633 14.4103 9.56661 14.4109 9.56983" +
  "C14.4879 9.97805 14.2184 10.3653 13.82 10.445ZM21 19.795H20.98" +
  "C20.8143 19.795 20.68 19.6606 20.68 19.495V10.075C20.68 9.01496 19.81 8.14496 18.74 8.14496" +
  "C18.6572 8.14496 18.59 8.21211 18.59 8.29496V19.495" +
  "C18.59 19.6606 18.4557 19.795 18.29 19.795H17.86C17.6943 19.795 17.56 19.6606 17.56 19.495" +
  "V5.12496C17.56 4.34496 17.19 3.64496 16.61 3.20496C16.57 3.17496 16.53 3.14496 16.49 3.11496" +
  "C16.24 2.92496 15.94 2.79496 15.62 2.75496C15.5879 2.74694 15.5494 2.73892 15.5148 2.73606" +
  "C15.4983 2.73469 15.4818 2.73354 15.4655 2.73092" +
  "C15.4384 2.72658 15.4114 2.72279 15.3843 2.72139" +
  "C15.3354 2.71886 15.2859 2.71495 15.2373 2.70919" +
  "C15.2015 2.70496 15.1658 2.70496 15.13 2.70496H8.87" +
  "C8.74885 2.70496 8.63639 2.71364 8.52451 2.73101" +
  "C8.50818 2.73355 8.49166 2.73462 8.47521 2.73615" +
  "C8.44347 2.73909 8.41174 2.74702 8.38 2.75496C8.06 2.80496 7.76 2.92496 7.51 3.11496" +
  "C7.47 3.14496 7.43 3.17496 7.39 3.20496C6.81 3.64496 6.44 4.34496 6.44 5.12496V19.495" +
  "C6.44 19.6606 6.30569 19.795 6.14 19.795H5.71C5.54431 19.795 5.41 19.6606 5.41 19.495" +
  "V8.29496C5.41 8.21211 5.34284 8.14496 5.26 8.14496C4.19 8.14496 3.32 9.01496 3.32 10.075" +
  "V19.495C3.32 19.6606 3.18569 19.795 3.02 19.795H3C2.59 19.795 2.25 20.135 2.25 20.545" +
  "C2.25 20.965 2.59 21.295 3 21.295H21C21.41 21.295 21.75 20.965 21.75 20.545" +
  "C21.75 20.135 21.41 19.795 21 19.795Z";

const drawHome = (ctx: CanvasRenderingContext2D) => {
  // `Path2D` takes SVG path data directly, so the icon is used as authored rather than re-traced
  // into canvas calls — which is what keeps it identical to the file it came from.
  ctx.fill(new Path2D(OFFICE_PATH), "evenodd");
};

/**
 * The one sprite id every destination's `icon-image` resolves to.
 *
 * A constant rather than a literal at the two call sites: those two are the feature builder and
 * the frame loop, and the frame loop replaces the whole FeatureCollection every frame. A typo in
 * either one empties the globe of destinations silently — a data-driven `icon-image` that does not
 * resolve draws nothing and logs nothing.
 */
const DEST_SPRITE = "amber-dest";

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
 * Origin badge geometry at 1x, in CSS pixels. The CENTRE is the coordinate, not a tip.
 *
 * A circle, not a teardrop. The two ends of the network are now different shapes as well as
 * different sizes — a destination is a pin dropped on a place, an origin is a person somewhere in
 * that country — which does more work than the filled-vs-outlined contrast it replaces.
 *
 * `pad` is room for the soft glow to fall into. Without it the shadow is clipped by the sprite's
 * own edge and reads as a hard band rather than a glow.
 */
const BADGE = { size: 34, ring: 2.2, pad: 3 };

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
const DEST_BADGE = { size: 26, ring: 1.9, pad: 3 };

/**
 * Draw an origin badge to an ImageData for `map.addImage`.
 *
 * Two layers: a white disc, then the character clipped into it. The character's own coloured disc is
 * part of its file, so there is no third ring to draw — see the note on the face set.
 *
 * The white ring is the load-bearing part. It is what lets a badge sit on green land or blue ocean
 * and still read as one object; the coloured disc alone has too little contrast against either, and
 * the pale-blue backgrounds in the set disappear into the sea entirely.
 */
const makeBadge = (photo: HTMLImageElement | null, ratio: number) => {
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

  // White disc, with the badge's only shadow. Set before the fill and cleared after, so it applies
  // to this disc alone — left on, it would also darken the edge of the face drawn over it.
  ctx.save();
  ctx.shadowColor = "rgba(17, 25, 40, 0.22)";
  ctx.shadowBlur = 3.4;
  ctx.shadowOffsetY = 0.8;
  ctx.beginPath();
  ctx.arc(c, c, rOuter, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  if (photo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(c, c, rFace, 0, Math.PI * 2);
    ctx.clip();
    // Drawn to the circle exactly. These are square images whose coloured background fills the
    // whole frame, so any oversizing would crop the disc rather than the head — the opposite of
    // what the bust set needed.
    ctx.drawImage(photo, c - rFace, c - rFace, rFace * 2, rFace * 2);
    ctx.restore();
  } else {
    // No face decoded: a plain dot in the network's own blue, so the origin is still on the map.
    ctx.beginPath();
    ctx.arc(c, c, rFace * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = NETWORK_BLUE;
    ctx.fill();
  }

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

/**
 * Draw a destination badge — a circle, sibling to the origin badges.
 *
 * The teardrop is gone. Origins became circular white-ringed badges, and keeping destinations as
 * pins meant the two ends of one network were different shapes for no reason a reader could name.
 * Both are discs now, and what tells them apart is what is INSIDE: a person's face against a
 * building, on a playful colour against amber's own blue.
 *
 * Blue rather than a second playful palette, deliberately. Origins are thirteen students from
 * thirteen places, so many colours is the point; destinations are all one company's listings, so one
 * colour is. It also keeps the arcs, the pins and the CTA on a single brand blue.
 */
const makeDestBadge = (ratio: number) => {
  const box = DEST_BADGE.size + DEST_BADGE.pad * 2;
  const canvas = document.createElement("canvas");
  canvas.width = box * ratio;
  canvas.height = box * ratio;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(ratio, ratio);

  const c = box / 2;
  const rOuter = DEST_BADGE.size / 2;
  const rInner = rOuter - DEST_BADGE.ring;

  // White ring, carrying the shadow. Same values as the origin badges — this is the detail that
  // makes the two read as one set rather than two components that happen to be circular.
  ctx.save();
  ctx.shadowColor = "rgba(17, 25, 40, 0.22)";
  ctx.shadowBlur = 3.4;
  ctx.shadowOffsetY = 0.8;
  ctx.beginPath();
  ctx.arc(c, c, rOuter, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(c, c, rInner, 0, Math.PI * 2);
  ctx.fillStyle = NETWORK_BLUE;
  ctx.fill();

  // The bed, knocked out in white.
  //
  // ── Two corrections, both about the fact that this glyph is WIDE ────────────
  // Maki's lodging icon uses its full 15 units of width (x 0 to 15) and only 10.5 of height
  // (y 2.5 to 13). That matters twice over:
  //
  // The building, knocked out in white, at 0.78 of the inner diameter.
  //
  // Larger than the 0.68 the house sat at, because this icon is DETAILED: it carries six window
  // slots and a doorway, and those are the marks that say "student block" rather than "shape".
  // Below about 17px of drawn glyph they close up and it reverts to a blob, so the glyph takes
  // more of the disc than a plain silhouette would need.
  //
  // ⚠️ Divided by 24, not 15 — this icon's viewBox is 24x24 where every earlier glyph was 15x15.
  const scale = (rInner * 2 * 0.78) / 24;
  ctx.save();
  ctx.translate(c - 12 * scale, c - 12 * scale);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  drawHome(ctx);
  ctx.restore();

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

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
}

const DemandGlobe = ({ onReady, focus = "all" }: DemandGlobeProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const arrivedRef = useRef<number[]>(PROPERTIES.map(() => 0));
  const hoveredRef = useRef<number | null>(null);
  /** Mirrors `focus` for the render loop, which runs outside React. */
  const focusRef = useRef<GlobeFocus>(focus);
  /** Set while the user is dragging or hovering, which pauses the sweep. */
  const heldRef = useRef(false);

  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  /** Screen position of the hover card, or null when its city faces away. */
  const [cardAt, setCardAt] = useState<{ x: number; y: number } | null>(null);

  /** Great-circle paths, sampled once — they are fixed in world space. */
  const paths = useMemo(
    () =>
      ROUTES.map((r) => {
        const from = ORIGINS[r.from].location;
        const to = PROPERTIES[r.to].location;
        return greatCircle([from[1], from[0]] as LngLat, [to[1], to[0]] as LngLat);
      }),
    [],
  );

  /**
   * Which destination is focused. Deliberately does NOT touch `heldRef`: the camera
   * hold belongs to "is the cursor over the globe at all", which the canvas'
   * enter/leave decides. Tying the two together meant that moving off a node — while
   * still on the globe — released the camera and the sphere started rotating under a
   * stationary cursor again.
   */
  const enter = useCallback((i: number | null) => {
    hoveredRef.current = i;
    setHovered(i);
  }, []);

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

      mapboxgl.accessToken = config.MAPBOX_ACCESS_TOKEN;
      try {
        map = new mapboxgl.Map({
          container: stageRef.current,
          // Mapbox Standard — what GL JS v3 uses when no style is given, i.e. the
          // default theme. Named explicitly rather than omitted so it is pinned and
          // obvious, but this is the out-of-the-box look.
          style: "mapbox://styles/mapbox/standard",
          projection: "globe",
          center: [SWEEP_CENTRE_LON, CAMERA_LAT],
          zoom: ZOOM,
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
      const facesReady = loadFaces();

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
        // ONE destination sprite for all eighteen cities. It was four, one per building
        // silhouette, picked per city by index — see `drawHome` for why that went.
        //
        // Still named through the features' `pin` property rather than a literal, so the
        // destination layer and the origin layer keep the same data-driven `icon-image`
        // expression and origins can stay one sprite per face.
        if (!map.hasImage(DEST_SPRITE)) {
          const badge = makeDestBadge(pinRatio);
          if (badge) map.addImage(DEST_SPRITE, badge as any, { pixelRatio: pinRatio });
        }

        // ONE SPRITE PER ORIGIN, because each carries a different face and a different halo.
        //
        // It used to be a single shared `amber-user-pin` with a drawn person glyph in it. A face
        // per origin means a sprite per origin, which the layer picks up through a data-driven
        // `icon-image` reading each feature's own `pin` property.
        //
        // Awaited before any layer is added: a layer naming an image that does not exist yet draws
        // nothing and only warns, so the pins would silently be missing on a slow decode. `await`
        // inside this handler is safe — everything after it is sequential anyway.
        const faces = await facesReady;
        if (cancelled) return;
        ORIGINS.forEach((_origin, i) => {
          const id = `amber-user-pin-${i}`;
          if (map.hasImage(id)) return;
          const badge = makeBadge(faces[i % faces.length], pinRatio);
          if (badge) map.addImage(id, badge as any, { pixelRatio: pinRatio });
        });

        // No `lineMetrics`: it existed only to supply `line-progress` to the
        // colour gradient, and the lines are a flat blue now.
        map.addSource("arcs", { type: "geojson", data: empty as any });
        map.addSource("origins", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: ORIGINS.map((o, i) => ({
              type: "Feature",
              id: i,
              // `pin` names this origin's own sprite — see the note where they are registered.
              properties: { glow: 0, muted: 0, label: o.label, pin: `amber-user-pin-${i}` },
              geometry: { type: "Point", coordinates: [o.location[1], o.location[0]] },
            })),
          } as any,
        });
        map.addSource("dests", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: PROPERTIES.map((c, i) => ({
              type: "Feature",
              id: i,
              properties: {
                idx: i,
                pulse: 0,
                muted: 0,
                weight: c.weight,
                name: c.label,
                count: c.enquiries,
                // Mapbox's symbol collision engine decides which labels survive,
                // but `symbol-sort-key` decides who wins — busiest city first.
                sort: 10 - c.weight,
                boost: 1,
                // Names the destination sprite. ⚠️ Also set in the frame loop below — that loop
                // replaces the whole FeatureCollection, so a property missing there vanishes from
                // the next frame on, and a data-driven `icon-image` resolving to null draws nothing
                // and warns nothing. That exact omission silently emptied the globe once already.
                pin: DEST_SPRITE,
                pinned: TOP_LABELS.has(i) ? 1 : 0,
                labelOn: TOP_LABELS.has(i) ? 1 : 0,
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
            ],
            // A quarter of the crisp line's opacity. Any more and the glow reads as a second,
            // blurry arc; any less and it does nothing at all.
            "line-opacity": ["*", ["get", "alpha"], 0.22],
            "line-blur": 5,
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
            ],
            "line-opacity": ["get", "alpha"],
            "line-color": NETWORK_BLUE,
          },
        });

        // Origins are outlined user pins — a student searching from that country. Quiet
        // until that origin is actually sending, when they brighten and grow a little.
        map.addLayer({
          id: "origins",
          type: "symbol",
          source: "origins",
          // Standard orders custom layers by slot; "top" puts the network above the
          // basemap and its own labels.
          slot: "top",
          layout: {
            // Data-driven: every origin has its own sprite, because every origin has its own face.
            "icon-image": ["get", "pin"],
            // Centre, not bottom. These are circular badges now — there is no tip to put on the
            // coordinate, so the coordinate goes in the middle of the circle.
            "icon-anchor": "center",
            "icon-size": ["interpolate", ["linear"], ["get", "glow"], 0, 0.84, 1, 1],
            // Always drawn — an origin that Mapbox decluttered away would silently drop a
            // country out of the story. And they must not consume the collision slots the
            // destination LABELS need.
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          },
          paint: {
            "icon-opacity": [
              "*",
              ["interpolate", ["linear"], ["get", "glow"], 0, 0.72, 1, 1],
              ["case", ["==", ["get", "muted"], 1], 0.3, 1],
            ],
          },
        });

        // No halo layer any more. It existed to make a 6px destination circle outrank a
        // 4px origin circle; a 34px pin does that by being a pin, and a pale pink disc
        // behind a pink pin only muddies its silhouette.

        // Destinations are home pins, anchored at the tip so the point of the
        // pin is the actual coordinate.
        map.addLayer({
          id: "dests",
          type: "symbol",
          source: "dests",
          // Standard orders custom layers by slot; "top" puts the network above
          // the basemap and its own labels.
          slot: "top",
          layout: {
            "icon-image": ["get", "pin"],
            // Centre, not bottom — these are circles now, with no tip to put on the coordinate.
            "icon-anchor": "center",
            // Scaled by a per-feature `boost` so the "destinations" step can enlarge the
            // pins. Turning every label on was not enough on its own: labels are also
            // gated by Mapbox's symbol collision, so most stay dropped however high their
            // opacity is, and the step read almost identically to the others.
            "icon-size": [
              "*",
              ["interpolate", ["linear"], ["get", "weight"], 2, 0.74, 5, 1],
              ["get", "boost"],
            ],
            // ── DECLUTTERED, which is a reversal ───────────────────────────────
            // This was `allow-overlap: true`, on the reasoning that a city with no mark is a
            // city the map does not claim, and that overlapping pins read as a cluster. Both
            // held while these were narrow teardrops and the city list had UK cities ~8px
            // apart. Neither survives eighteen circular badges: seven of them land inside a
            // ~90px patch of Europe, and identical discs stacked on identical discs do not read
            // as a cluster — they read as one broken mark. Nothing is countable and nothing is
            // legible, which is worse than a city going unmarked at this zoom.
            //
            // So Mapbox declutters them by `symbol-sort-key`, which is `10 - weight`: the
            // busiest city in any overlapping group is the one that survives. Zoom in and the
            // rest come back, because the collision is resolved in screen space.
            "icon-allow-overlap": false,
            // False, and this is the pair to the line above: an icon with
            // `ignore-placement: true` is never entered into the collision index, so other
            // pins cannot see it and nothing would ever declutter. It has to block to be
            // blocked.
            "icon-ignore-placement": false,
            // A little air between survivors, so two kept pins are not left edge to edge.
            "icon-padding": 2,
            "symbol-sort-key": ["get", "sort"],
          },
          paint: {
            "icon-opacity": ["case", ["==", ["get", "muted"], 1], 0.45, 1],
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
            "circle-radius": ["interpolate", ["linear"], ["get", "pulse"], 0, 22, 1, 6],
            "circle-color": "rgba(0,0,0,0)",
            "circle-stroke-width": 1.4,
            "circle-stroke-color": NETWORK_BLUE,
            "circle-stroke-opacity": ["*", ["get", "pulse"], 0.55],
          },
        });

        // Labels. `text-allow-overlap: false` is the whole reason the hand-authored
        // offsets and leader lines the flat map needed are absent here: Mapbox drops
        // whichever label cannot fit, highest sort-key first.
        map.addLayer({
          id: "dest-labels",
          // Standard orders custom layers by slot; "top" puts the network above
          // the basemap and its own labels.
          slot: "top",
          type: "symbol",
          source: "dests",
          layout: {
            // Emptied rather than only faded: a symbol at text-opacity 0 is still
            // placed and still occupies the collision index, so twelve invisible
            // labels were blocking each other and the basemap.
            "text-field": [
              "case",
              [">", ["get", "labelOn"], 0.02],
              ["concat", ["get", "name"], "  ", ["to-string", ["get", "count"]]],
              "",
            ],
            // No `text-font`: Standard serves its own glyph stack, and naming one it
            // does not have drops the label silently.
            "text-size": 12.5,
            // -2.9em at 12.5px is ~36px, which clears the 34px pin standing above the
            // coordinate. At the old -1.5 the label sat inside the pin's head.
            "text-offset": [0, -2.9],
            "text-anchor": "bottom",
            // Collision ON, now that the basemap is not competing for it: our labels
            // declutter against each other, so the UK cluster resolves itself the way
            // it did on the flat map — without hand-authored offsets.
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            "symbol-sort-key": ["get", "sort"],
            "text-optional": false,
          },
          paint: {
            "text-color": "#111928",
            "text-halo-color": "rgba(255,255,255,0.95)",
            "text-halo-width": 1.8,
            "text-opacity": ["get", "labelOn"],
          },
        });

        // Hover is driven off the node layer, so the target is the mark itself.
        map.on("mousemove", "dests", (e: any) => {
          const f = e.features && e.features[0];
          if (f) {
            enter(f.properties.idx);
            map.getCanvas().style.cursor = "pointer";
          }
        });
        map.on("mouseleave", "dests", () => {
          enter(null);
          map.getCanvas().style.cursor = "";
        });
        map.on("dragstart", () => {
          heldRef.current = true;
        });
        // No release here — the canvas' mouseleave owns that, so a drag that ends
        // with the cursor still on the globe leaves it held.
        map.on("dragend", () => {});

        // The camera stops as soon as the cursor is anywhere over the globe, and
        // resumes when it leaves. This is the difference between the nodes being
        // hoverable and not: they are ~6px marks on a surface that is rotating, so
        // on a moving globe you have to chase one, and Mapbox only fires `mousemove`
        // when the POINTER moves — a globe turning under a stationary cursor never
        // re-fires it, so the hover silently never happens. (Measured: the card
        // never opened at all before this.) Settling on approach means that by the
        // time the cursor is near a city, that city is holding still.
        const canvas = map.getCanvas();
        canvas.addEventListener("mouseenter", () => {
          heldRef.current = true;
        });
        canvas.addEventListener("mouseleave", () => {
          heldRef.current = false;
          enter(null);
        });

        startRef.current = Date.now();

        onReady?.();

        const frame = () => {
          const now = Date.now();
          const elapsed = now - startRef.current;
          const hover = hoveredRef.current;

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

          // Camera. A bounded sinusoid, so the reversal reads as easing round
          // rather than bouncing, and the Pacific is never centred.
          if (!still && !heldRef.current) {
            const lon =
              SWEEP_CENTRE_LON + SWEEP_DEG * Math.sin((2 * Math.PI * elapsed) / SWEEP_MS);
            map.setCenter([lon, CAMERA_LAT]);
          }

          const drawing = still
            ? ROUTES.map((_, i) => ({ i, phase: STILL_PHASE }))
            : SLOTS.map((slot) => ({ i: slot.route, phase: phaseFor(slot, elapsed) }));

          const features: any[] = [];
          const pulses = PROPERTIES.map(() => 0);
          const glows = ORIGINS.map(() => 0);

          for (const item of drawing) {
            const { active, head, tail, landed } = item.phase;
            if (!active) continue;
            const route = ROUTES[item.i];
            glows[route.from] = Math.max(glows[route.from], still ? 1 : originGlow(head));

            if (!still && landed > 0) {
              pulses[route.to] = Math.max(pulses[route.to], 1 - landed);
              if (landed < 0.15) arrivedRef.current[route.to] = now;
            }

            const coords = slicePath(paths[item.i], tail, head);
            if (coords.length < 2) continue;
            const dim = hover !== null && route.to !== hover;
            features.push({
              type: "Feature",
              properties: {
                head,
                // Arcs carry the story in "arcs" mode, so they brighten and thicken;
                // in the node-focused modes they step back rather than disappear.
                alpha: dim ? 0.09 : arcsBoosted ? 1 : dimDests || dimOrigins ? 0.42 : 0.95,
              },
              geometry: { type: "LineString", coordinates: coords },
            });
          }

          const arcSrc = map.getSource("arcs");
          if (arcSrc) {
            arcSrc.setData({ type: "FeatureCollection", features } as any);
          }

          // Feature state would be tidier than setData for the node properties, but
          // `circle-radius` cannot read feature-state in this style spec version, so
          // the two point sources are rewritten instead. Twenty-five features is
          // nothing next to the arc source that is rewritten anyway.
          const destSrc = map.getSource("dests");
          if (destSrc) {
            destSrc.setData({
              type: "FeatureCollection",
              features: PROPERTIES.map((c, i) => ({
                type: "Feature",
                id: i,
                properties: {
                  idx: i,
                  pulse: pulses[i],
                  muted: (hover !== null && hover !== i) || (hover === null && dimDests) ? 1 : 0,
                  weight: c.weight,
                  name: c.label,
                  count: c.enquiries,
                  sort: 10 - c.weight,
                  boost: allDestLabels ? 1.3 : 1,
                  // ⚠️ Re-stated, not inherited. This loop replaces the whole FeatureCollection, so
                  // omitting `pin` here drops every destination badge off the globe from the next
                  // frame onward — silently, because a data-driven `icon-image` that resolves to
                  // null draws nothing and logs nothing. This happened once with the origins.
                  pin: DEST_SPRITE,
                  // Permanent for the four biggest; the rest ride in on an arrival
                  // and fade out, so the globe is never carrying twelve labels.
                  labelOn:
                    TOP_LABELS.has(i) || hover === i || (hover === null && allDestLabels)
                      ? 1
                      : hover === null && dimDests
                        ? 0
                        : clamp01(1 - (now - arrivedRef.current[i]) / LABEL_MS),
                },
                geometry: { type: "Point", coordinates: [c.location[1], c.location[0]] },
              })),
            } as any);
          }

          const originSrc = map.getSource("origins");
          if (originSrc) {
            originSrc.setData({
              type: "FeatureCollection",
              features: ORIGINS.map((o, i) => ({
                type: "Feature",
                id: i,
                properties: {
                  glow: allOriginsLit ? 1 : glows[i],
                  muted:
                    hover !== null
                      ? ROUTES_BY_ORIGIN[i].some((r) => r.to === hover)
                        ? 0
                        : 1
                      : dimOrigins
                        ? 1
                        : 0,
                  label: o.label,
                  // ⚠️ MUST be re-stated here, not just in the initial source data.
                  //
                  // This loop replaces the whole FeatureCollection every frame, so any property it
                  // omits is gone from the next frame onward. `pin` names each origin's sprite and
                  // the layer reads it through `["get", "pin"]`, so leaving it out dropped every
                  // origin pin off the globe from the first frame — silently, because a
                  // data-driven `icon-image` that resolves to null draws nothing and warns nothing.
                  pin: `amber-user-pin-${i}`,
                },
                geometry: { type: "Point", coordinates: [o.location[1], o.location[0]] },
              })),
            } as any);
          }

          // Hover card position. `project()` alone is not enough — it returns a
          // point for the far side of the globe too, so the card would appear over
          // the wrong hemisphere while its city is hidden behind the earth.
          if (hover !== null) {
            const c = PROPERTIES[hover];
            const centre = map.getCenter();
            if (isFacing(c.location[1], c.location[0], centre)) {
              const pt = map.project([c.location[1], c.location[0]]);
              setCardAt({ x: pt.x, y: pt.y });
            } else {
              setCardAt(null);
            }
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
  }, [paths, enter, onReady]);

  const fmt = (n: number) => n.toLocaleString("en-GB");
  const city = hovered === null ? null : PROPERTIES[hovered];

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

          {city && cardAt ? (
            <span
              className={styles.card}
              style={{ left: cardAt.x, top: cardAt.y }}
              aria-hidden="true"
            >
              <span className={styles.cardHead}>
                <img src={city.flag} alt="" className={styles.cardFlag} />
                <b>{city.label}</b>
                <span className={styles.cardCountry}>{city.country}</span>
              </span>
              <span className={styles.cardStat}>
                <b>{fmt(city.enquiries)}</b> enquiries
              </span>
              {/* Three figures a property owner decides on: how much amber already lists
                  here, whether those rooms fill, and what one booking is worth. Set as a
                  3-up with rules between, which is the treatment the stat cards in "Why
                  partners" use — the card is a per-city version of those.

                  The first cell was an enquiries-per-ROOM ratio, derived from a room count.
                  It is now a straight property count, which is a different claim: supply
                  amber has here, rather than demand per unit of it. */}
              <span className={styles.cardGrid}>
                <span className={styles.cardCell}>
                  <b>{city.properties}</b>
                  {/* "properties", not "properties listed": at 10px the second word does
                      not fit a third of this card, and a label that wraps in one cell and
                      not the others knocks the three figures out of line with each
                      other. */}
                  <i>properties</i>
                </span>
                <span className={styles.cardCell}>
                  <b>{city.filled}%</b>
                  <i>rooms filled</i>
                </span>
                <span className={styles.cardCell}>
                  <b>${(city.avgBooking / 1000).toFixed(1)}k</b>
                  <i>avg booking</i>
                </span>
              </span>
              {PARTNERS_BY_CITY[hovered as number].length ? (
                <span className={styles.cardPartners}>
                  {PARTNERS_BY_CITY[hovered as number].map((partner) => (
                    <img key={partner.name} src={partner.logo} alt="" className={styles.cardLogo} />
                  ))}
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
      )}

      <p className={styles.srOnly}>
        amber lists student accommodation in {TOTALS.cities} cities across{" "}
        {TOTALS.listedCountries} countries:{" "}
        {PROPERTIES.map((c) => `${c.label}, ${c.country} (${c.enquiries} enquiries)`).join("; ")}.
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
