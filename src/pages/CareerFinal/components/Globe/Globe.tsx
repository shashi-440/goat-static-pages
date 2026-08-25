import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
// The About Us count-up: renders the final value on the server so the figures
// are present without JS, then counts from 0 once visible.
import CountUp from "../../../AboutUsV2/components/CountUp/CountUp";
import LottieIcon from "../LottieIcon/LottieIcon";
import styles from "./Globe.module.scss";
// Team headshots — the markers are the people, not the places. Six individual
// shots plus five crew shots is every face this page has; with fifteen markers a
// few faces necessarily appear twice, so the repeats are placed far apart (and
// never in the same hemisphere) where the rotation will not show them together.
// The twenty-one headshots, exported from Figma (Career Page Cleanup, node
// 2979:4455) where each photo is labelled with its owner's name and country.
//
// Cropped to head-and-shoulders before committing: the exports are waist-up
// portraits, so a plain square centre-crop lands on the chest. Each face was
// located with macOS Vision (VNDetectFaceRectangles) and the crop taken as a
// square 2.6x the face box, centred on it and biased 12% of a face-height upward
// so the eyes sit above the middle. That per-photo measurement matters: the
// detected face ranges from 10% of frame width (Gautam, a distant shot) to 50%
// (Robin, a close-up), so one fixed crop would have been wrong for most of them.
// 256px square at q86 — 8x the 32px pin, so retina-sharp at ~12KB each.
import harshalImg from "../../assets/people/harshal-maniyar.jpg";
import bhanuImg from "../../assets/people/bhanu-mahajan.jpg";
import prachiImg from "../../assets/people/prachi-kamble.jpg";
import gautamImg from "../../assets/people/gautam-bagga.jpg";
import shreyImg from "../../assets/people/shrey.jpg";
import davidImg from "../../assets/people/david-seymor.jpg";
import marielleImg from "../../assets/people/marielle.jpg";
import joolsImg from "../../assets/people/jools.jpg";
import robinImg from "../../assets/people/robin-walsh.jpg";
import michaelImg from "../../assets/people/adeniran-michael.jpg";
import solomonImg from "../../assets/people/ajibode-solomon.jpg";
import mohammedImg from "../../assets/people/mohammed-husien.jpg";
import ahmedImg from "../../assets/people/ahmed-sammy.jpg";
import mirnaImg from "../../assets/people/mirna-abdo.jpg";
import mernaImg from "../../assets/people/merna-elgezawy.jpg";
import peterImg from "../../assets/people/peter.jpg";
import damienImg from "../../assets/people/damien-pang.jpg";
import joeyImg from "../../assets/people/joey-panithan.jpg";
import anqiImg from "../../assets/people/anqi-zhao.jpg";
import summerImg from "../../assets/people/summer-xia.jpg";
import danImg from "../../assets/people/dan-teo.jpg";

// Country flags, 72x72 PNGs named by ISO 3166-1 alpha-2 — the same set and
// naming the ListWithUs demand map uses.
import flagGB from "../../assets/flags/gb.png";
import flagNG from "../../assets/flags/ng.png";
import flagEG from "../../assets/flags/eg.png";
import flagTH from "../../assets/flags/th.png";
import flagCN from "../../assets/flags/cn.png";
import flagIN from "../../assets/flags/in.png";
// The mark for "Languages spoken" — verified to render (it is one of the icons in
// this folder that ends on a drawn frame).
import globeAnim from "../../assets/lottie/globe.json";

interface Person {
  name: string;
  /** Team, shown on the hover card. */
  department: string;
  /** Country as displayed, alongside its flag. */
  country: string;
  flag: string;
  /** Real [latitude, longitude] — where the face sits on the sphere. */
  location: [number, number];
  /** Head-and-shoulders crop. All twenty-one have one. */
  photo: string;
}

// The twenty-one people, grouped by country.
//
// PLACEMENT. These coordinates are NOT the exact office cities, and that is
// deliberate. A 32px face subtends ~8deg of arc on this globe while the whole of
// Britain spans ~9deg, so the UK's four cannot all sit inside it without
// overlapping. Every option was measured: real cities gave a 5px worst-case gap,
// strict borders 8-9px, land-only regional corridors 17px — all against a face
// needing 36px. Only letting a pin drift into the surrounding sea or a
// neighbouring country clears it.
//
// So each pin is bounded to a radius around its country's centre: far enough to
// separate, close enough to still read as "near the UK" or "near Egypt". Some sit
// offshore. The hover card carries the true country, which is what makes that
// acceptable — the pin says roughly where, the card says exactly who.
//
// Found by simulated annealing over a full 360deg rotation at six tilt angles,
// maximising the worst-case on-screen distance between any two simultaneously
// visible faces. Do NOT hand-edit a coordinate without re-running that check:
// moving one pin can push a different pair into collision.
const PEOPLE: Person[] = [
  // ---- United Kingdom ----
  { name: "David Seymor", department: "Product", country: "United Kingdom", flag: flagGB, location: [57.338, 20.742], photo: davidImg },
  { name: "Marielle", department: "Partnerships", country: "United Kingdom", flag: flagGB, location: [70.331, -10.406], photo: marielleImg },
  { name: "Jools", department: "Partnerships", country: "United Kingdom", flag: flagGB, location: [40.634, -26.185], photo: joolsImg },
  { name: "Robin Walsh", department: "Business Development", country: "United Kingdom", flag: flagGB, location: [42.654, 7.993], photo: robinImg },
  // ---- Nigeria ----
  { name: "Ajibode Solomon", department: "Business Development", country: "Nigeria", flag: flagNG, location: [-7.446, 15.407], photo: solomonImg },
  { name: "Adeniran Michael", department: "Business Development", country: "Nigeria", flag: flagNG, location: [4.653, -2.814], photo: michaelImg },
  // ---- Egypt ----
  { name: "Mohammed Husien", department: "Operations", country: "Egypt", flag: flagEG, location: [24.95, 40.979], photo: mohammedImg },
  { name: "Ahmed Sammy", department: "Supply", country: "Egypt", flag: flagEG, location: [41.959, 40.934], photo: ahmedImg },
  { name: "Merna Elgezawy", department: "Business Development", country: "Egypt", flag: flagEG, location: [25.437, 17.501], photo: mernaImg },
  { name: "Mirna Abdo", department: "Employee Experience", country: "Egypt", flag: flagEG, location: [12.205, 20.796], photo: mirnaImg },
  { name: "Peter", department: "Operations", country: "Egypt", flag: flagEG, location: [11.866, 41.215], photo: peterImg },
  // ---- Thailand ----
  { name: "Damien Pang", department: "Growth", country: "Thailand", flag: flagTH, location: [12.277, 125.729], photo: damienImg },
  { name: "Joey Panithan Ittisan", department: "Supply", country: "Thailand", flag: flagTH, location: [-0.19, 123.647], photo: joeyImg },
  // ---- China ----
  { name: "Anqi Zhao", department: "Operations", country: "China", flag: flagCN, location: [49.36, 128.042], photo: anqiImg },
  { name: "Summer Xia", department: "Market Expansion", country: "China", flag: flagCN, location: [48.092, 99.15], photo: summerImg },
  { name: "Dan Teo", department: "Global Operations", country: "China", flag: flagCN, location: [26.432, 126.061], photo: danImg },
  // ---- India ----
  { name: "Bhanu Mahajan", department: "Supply", country: "India", flag: flagIN, location: [15.462, 91.442], photo: bhanuImg },
  { name: "Prachi Kamble", department: "Marketing", country: "India", flag: flagIN, location: [31.119, 87.299], photo: prachiImg },
  { name: "Harshal Maniyar", department: "Product", country: "India", flag: flagIN, location: [28.596, 65.814], photo: harshalImg },
  { name: "Shrey", department: "Data", country: "India", flag: flagIN, location: [15.109, 69.039], photo: shreyImg },
  { name: "Gautam Bagga", department: "Growth", country: "India", flag: flagIN, location: [2.519, 75.072], photo: gautamImg },
];


interface Stat {
  target: number;
  suffix: string;
  label: string;
  /**
   * Overlapping circles above the figure. Mutually exclusive with `lottie`.
   *
   * Every stat carries a visual of the same size and count, which is the point:
   * three columns where one has a picture and two do not reads as two of them
   * being unfinished. What changes is only what is INSIDE the circles.
   */
  stack?: string[];
  /** A mark, for the stat that has no photograph. Mutually exclusive with `stack`. */
  lottie?: any;
  /** One description for the whole visual, so a screen reader reads it once. */
  stackLabel: string;
}

// Business stats, replacing the stale "7 offices, 20 nationalities" prose that
// used to carry these numbers inside the lede.
// Labels verbatim from Figma 1565:3930.
const STATS: Stat[] = [
  {
    target: 500,
    suffix: "+",
    label: "Amazing people",
    // Real teammates, taken from the same head-cropped set the globe pins use
    // rather than stock — this stat is about these people.
    stack: [harshalImg, davidImg, anqiImg],
    stackLabel: "People across the amber team",
  },
  {
    target: 20,
    suffix: "+",
    label: "Nationalities represented",
    // THREE, matching the stack beside it. A fourth circle would make this column
    // wider than its neighbours and give the row no rhythm. Three of the largest
    // markets, not a ranking: the figure is the count, and the flags only have to
    // say "from everywhere".
    stack: [flagIN, flagGB, flagCN],
    stackLabel: "Team members from over 20 nationalities",
  },
  {
    target: 15,
    suffix: "+",
    label: "Languages spoken",
    // No photograph exists of a spoken language, so this column plays a mark
    // instead. It keeps the same 32px box as the stacks so the three figures stay
    // on one line — a taller visual here would push this number down alone.
    lottie: globeAnim,
    stackLabel: "Over 15 languages spoken across the team",
  },
];

// ---- Limb falloff --------------------------------------------------------
// A face is fully solid while its depth is above FADE_END, then eases out,
// reaching nothing at FADE_START. Both are depth values (1 = facing the viewer,
// 0 = exactly on the limb), so keeping FADE_START WELL above 0 is what makes a
// face leave before it reaches the silhouette edge rather than clinging to it.
const FADE_START = 0.34; // gone by here
const FADE_END = 0.68; // fully solid above here

// How small a face gets as it reaches FADE_START. It shrinks toward the limb on
// the way out and grows on the way in, which is what sells it as rotating away
// rather than dissolving in place.
const EDGE_SCALE = 0.55;

const SIZE = 622; // Figma's globe container is 622x622.

// Idle spin speed, radians per frame.
const SPIN = 0.0025;

// Sphere radius as a fraction of the canvas box. COBE draws the globe inset from
// the edges; this is the value at which projected pins sit ON the coastline
// rather than floating outside the sphere. Tune this ONE number if a pin drifts.
const R = 0.4;

// How far the globe must be dragged (px) before it counts as a drag rather than
// a click. Stops a sloppy click from spinning the globe.
const DRAG_SLOP = 3;

// Scroll-in zoom. The globe eases UP to its resting size rather than down from a
// larger one: COBE draws into a fixed-size canvas, so any scale that makes the
// sphere wider than the canvas is simply cropped by the drawing surface — no CSS
// overflow involved, and nothing can recover those pixels. At R = 0.4 the sphere
// spans 0.8 x canvas at scale 1, so 1.0 is the largest value that still fits.
const ZOOM_FROM = 0.72;
const ZOOM_TO = 1;
const ZOOM_MS = 1400;

/** Decelerating ease, for movements that start immediately and settle gently. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Depth -> how present a face is, 0 to 1.
 *
 * Ramped with a smoothstep rather than linearly: a linear ramp has a visible
 * kink at both ends of the fade, and the whole point here is that the face
 * leaves and returns without a moment you can point at.
 */
const presence = (z: number) => {
  const t = Math.max(0, Math.min(1, (z - FADE_START) / (FADE_END - FADE_START)));
  return t * t * (3 - 2 * t);
};

/**
 * Longitude → COBE `phi` so the point faces the viewer.
 *
 * The 270° is derived, not guessed. COBE's landmass texture is a 256x128
 * equirectangular PNG embedded in the bundle; decoding it and sampling all seven
 * offices showed that the map's longitude origin sits 180° from where the naive
 * mapping puts it, and the shader's swizzled sphere vector adds a further 90°.
 * Together: phi = 270 - lon. Verified three ways — each city lands dead centre
 * when hovered, each samples as LAND in that texture, and no pin leaves the
 * sphere across a full rotation.
 */
const phiFor = (lon: number) => ((270 - lon) * Math.PI) / 180;

/** Screen position of a pin, plus how far toward the viewer it faces. */
interface Projected {
  x: number;
  y: number;
  /**
   * Depth along the view axis, -1 (far pole) to 1 (facing the viewer). Kept as
   * the raw value rather than a front/back boolean so the pin can fade and
   * shrink across the limb instead of snapping off at the exact edge.
   */
  z: number;
}

/**
 * Project a lat/long to canvas pixels for the current rotation.
 *
 * COBE uses an orthographic camera, so this is a plain orthographic projection:
 * put the point on a unit sphere, apply the globe's yaw (phi) then pitch (theta),
 * and drop z. The returned `z` is the depth toward the viewer, which the pin
 * layer turns into opacity and scale so faces ease away around the limb.
 *
 * The rotation order matters and must match COBE's: yaw about the vertical axis
 * first, then pitch about the horizontal one. Applying the pitch to y/z only
 * (and leaving x untouched) is correct precisely because the pitch axis IS x.
 */
const project = (
  lat: number,
  lon: number,
  phi: number,
  theta: number,
  scale: number,
): Projected => {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;

  // Sphere position in COBE's own frame. The signs put our longitude on the same
  // meridian the embedded landmass texture uses (see `phiFor`) — this and phiFor
  // MUST agree, or the pins are self-consistent but land in the sea.
  const x0 = Math.cos(la) * Math.cos(lo);
  const y0 = Math.sin(la);
  const z0 = -Math.cos(la) * Math.sin(lo);

  // Yaw about the vertical axis.
  const xr = x0 * Math.cos(phi) + z0 * Math.sin(phi);
  const zr = -x0 * Math.sin(phi) + z0 * Math.cos(phi);

  // Then pitch about the horizontal axis, so x is unchanged.
  const yr = y0 * Math.cos(theta) - zr * Math.sin(theta);
  const z2 = y0 * Math.sin(theta) + zr * Math.cos(theta);

  // Radius tracks COBE's `scale`, so the pins stay attached to the surface while
  // the zoom animates rather than sliding across it.
  const r = SIZE * R * scale;
  return { x: SIZE / 2 + xr * r, y: SIZE / 2 - yr * r, z: z2 };
};

/**
 * "A team creating tremendous value" — the offices globe (Figma 2859:17974).
 *
 * A COBE dot-sphere idles with a slow spin, carrying a team member's face at each
 * office location so the section reads as people spread across the world rather
 * than a set of map markers. The globe can still be grabbed and spun by hand.
 *
 * There is deliberately NO hover or click targeting: the avatars are presentational
 * (plain divs, not buttons) and the globe never rotates to a chosen city. The city
 * names remain as static pills in the copy column.
 *
 * Avatars are HTML rather than COBE markers because COBE draws markers inside its
 * shader as flat dots — it cannot render an image. They are positioned every frame
 * by projecting their lat/long through the current rotation.
 */
const Globe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  // Index of the person whose card is open, or null. Also read by the render
  // loop (through activeRef) to hold the globe still while a card is up.
  const [active, setActive] = useState<number | null>(null);
  // Plays the stats' mark once the row is on screen. The row sits below the fold,
  // so a self-starting one-shot would run unseen and then hold finished forever.
  const [statsShown, setStatsShown] = useState(false);
  const [pins, setPins] = useState<Projected[]>(() =>
    PEOPLE.map(() => ({ x: SIZE / 2, y: SIZE / 2, z: -1 })),
  );

  // Live rotation, in refs so the render loop mutates it without re-rendering.
  const phiRef = useRef(phiFor(60));
  const thetaRef = useRef(0.2);
  // Zoom, animated on first scroll into view. COBE's own `scale` option.
  const scaleRef = useRef(ZOOM_FROM);
  const revealRef = useRef<{ start: number } | null>(null);
  // Drag state: pointer id, last position, and whether the slop was exceeded.
  const dragRef = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  // Mirrors `active` for the render loop. The loop is created once inside an
  // effect and closes over that scope, so reading the state variable there would
  // pin it to its initial null forever.
  const activeRef = useRef<number | null>(null);
  const statsRef = useRef<HTMLUListElement>(null);

  // Fire the stats' mark the first time the row scrolls into view.
  useEffect(() => {
    const node = statsRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setStatsShown(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStatsShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // Keep the loop's view of the open card current.
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // ---- Drag to spin -------------------------------------------------------
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
    wrapRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;

    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_SLOP) return;

    if (!d.moved) {
      d.moved = true;
      setDragging(true);
    }

    // Screen px → radians. A full canvas width is a bit over half a turn, which
    // feels close to grabbing the surface. Signs are set so the surface follows
    // the cursor: drag right and the globe turns right, not against you.
    phiRef.current += (dx / SIZE) * Math.PI * 1.4;
    // Vertical: increasing theta moves surface points DOWN the screen (verified
    // against the projection — a point at theta = lat+10deg sits ~43px lower than
    // at theta = lat), so theta must increase with dy for the surface to follow
    // the cursor. Clamped so the globe cannot be tumbled over the poles.
    thetaRef.current = Math.max(
      -Math.PI / 2.6,
      Math.min(Math.PI / 2.6, thetaRef.current + (dy / SIZE) * Math.PI * 0.8),
    );
    d.x = e.clientX;
    d.y = e.clientY;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    if (wrapRef.current?.hasPointerCapture(e.pointerId)) {
      wrapRef.current.releasePointerCapture(e.pointerId);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const still =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Pins used to resync at ~30fps, which was fine when only their position
    // moved. They now also scale and fade across the limb, and a ramp at 30fps
    // visibly steps — so this runs every frame. It is one setState of N small
    // objects per frame, which React handles fine at this count.
    let lastSync = 0;

    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: SIZE * 2,
      height: SIZE * 2,
      phi: phiRef.current,
      theta: thetaRef.current,
      // Starts zoomed in; the reveal effect below eases it out to ZOOM_TO.
      scale: scaleRef.current,
      dark: 0,
      diffuse: 0,
      mapSamples: 22000,
      mapBrightness: 1.6,
      mapBaseBrightness: 0.06,
      baseColor: [1, 1, 1],
      // Unused — pins are HTML overlays — but the option is required.
      markerColor: [1, 0.341, 0.443],
      glowColor: [1, 1, 1],
      markers: [],
      onRender: (state: Record<string, any>) => {
        const now = Date.now();

        if (dragRef.current?.moved) {
          // Hand-driven: onPointerMove already set phi/theta this frame.
        } else if (activeRef.current !== null) {
          // A card is open. Hold the globe still — the face it points at would
          // otherwise drift out from under the cursor, and the card would chase
          // it across the screen. Drag still works; only the idle spin pauses.
        } else if (!still) {
          phiRef.current += SPIN;
          thetaRef.current += (0.2 - thetaRef.current) * 0.05;
        }

        // First scroll into view: ease the zoom out from ZOOM_FROM to ZOOM_TO.
        const rv = revealRef.current;
        if (rv) {
          const p = Math.min(1, (now - rv.start) / ZOOM_MS);
          scaleRef.current = ZOOM_FROM + (ZOOM_TO - ZOOM_FROM) * easeOut(p);
          if (p >= 1) revealRef.current = null;
        }

        state.phi = phiRef.current;
        state.theta = thetaRef.current;
        state.scale = scaleRef.current;

        if (now - lastSync > 15) {
          lastSync = now;
          setPins(
            PEOPLE.map((o) =>
              project(
                o.location[0],
                o.location[1],
                phiRef.current,
                thetaRef.current,
                scaleRef.current,
              ),
            ),
          );
        }
      },
    });

    return () => globe.destroy();
  }, []);

  // Kick the zoom-out the first time the globe scrolls into view. Once only —
  // re-triggering on every pass would re-zoom while the user is interacting.
  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return undefined;

    // No IntersectionObserver (or reduced motion): show it at rest immediately.
    const still =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still || typeof IntersectionObserver === "undefined") {
      scaleRef.current = ZOOM_TO;
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          revealRef.current = { start: Date.now() };
          io.disconnect();
        }
      },
      // A third of the globe visible is enough to have earned the animation.
      { threshold: 0.33 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <Reveal className={styles.copy}>
          <h2 className={styles.title}>A team creating tremendous value</h2>
          <p className={styles.lede}>
            Amber is built for the world, from India — a business that touches nearly every country
            on the map. It’s a rare vantage point, and a rare chance to build at global scale
            without any geographic constraints.
          </p>

          {/* The figures the lede used to carry as prose. Counting them up gives
              them the weight a sentence clause never had. */}
          <ul ref={statsRef} className={styles.stats}>
            {STATS.map((stat, i) => (
              <Reveal as="li" key={stat.label} className={styles.stat} delay={160 + i * 90}>
                {/* One `role="img"` with a single label for the whole visual, not
                    an alt per circle — three separate alts would have a screen
                    reader read out three flags before reaching the number they
                    illustrate. */}
                <span className={styles.stack} role="img" aria-label={stat.stackLabel}>
                  {stat.lottie ? (
                    <LottieIcon animationData={stat.lottie} size={32} play={statsShown} />
                  ) : (
                    stat.stack?.map((src) => (
                      <span className={styles.chip} key={src}>
                        <img className={styles.chipArt} src={src} alt="" />
                      </span>
                    ))
                  )}
                </span>
                <CountUp
                  className={styles.statValue}
                  target={stat.target}
                  suffix={stat.suffix}
                />
                <span className={styles.statLabel}>{stat.label}</span>
              </Reveal>
            ))}
          </ul>

        </Reveal>

        {/* Pointer handlers sit on the wrapper so a drag can start anywhere over
            the globe, including on a pin. */}
        <div
          ref={wrapRef}
          className={`${styles.globeWrap} ${dragging ? styles.isDragging : ""}`}
          style={{ width: SIZE, height: SIZE }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            style={{ width: SIZE, height: SIZE }}
            aria-label="A rotating globe marking where amber's team works around the world"
            role="img"
          />

          {/* Faces over the canvas, easing out around the limb.
              Each face is now interactive: hovering one opens its detail card.
              The LAYER stays transparent to pointer events (see .pinLayer) and
              each face opts back in, so a drag begun on the ocean between faces
              still grabs and spins the globe.

              A face below the fade threshold is skipped entirely rather than
              rendered at opacity 0 — an invisible face on the far side of the
              sphere would otherwise still be hoverable, and the cursor would
              open a card for someone who is not on screen. */}
          <div className={styles.pinLayer}>
            {PEOPLE.map((person, i) => {
              const p = pins[i];
              // Depth drives both opacity and scale, so a face eases away as it
              // rotates toward the limb and eases back as it comes round —
              // symmetric in both directions, which is what makes the motion
              // read as the sphere turning rather than as a cross-fade.
              const k = presence(p.z);
              // A face on the far side is drawn at opacity 0 rather than skipped.
              // Returning null here looked tempting — an invisible face should
              // not be hoverable — but it also unmounts the card mid-transition,
              // and on the very first paint (before the render loop has projected
              // anything) every pin is still at its initial z of -1, so ALL of
              // them cull and the layer mounts empty. `hittable` below is what
              // actually stops a back-of-globe face taking the pointer.
              const hittable = k > 0.35;
              const isActive = active === i;
              return (
                <div
                  key={person.name}
                  className={`${styles.avatarPin} ${isActive ? styles.avatarPinActive : ""}`}
                  style={{
                    left: p.x,
                    top: p.y,
                    opacity: k,
                    transform: `translate(-50%, -50%) scale(${
                      EDGE_SCALE + (1 - EDGE_SCALE) * k
                    })`,
                    // Nearer faces sit above further ones, so an overlap at the
                    // limb layers the way the geometry implies.
                    zIndex: 2 + Math.round(k * 10),
                    // Only a face turned toward the viewer takes the pointer, so
                    // the cursor never opens a card for someone on the far side.
                    pointerEvents: hittable ? "auto" : "none",
                  }}
                  onPointerEnter={() => setActive(i)}
                  onPointerLeave={() => setActive((cur) => (cur === i ? null : cur))}
                  // Keyboard reachable: the card is real content, so it cannot be
                  // hover-only. Focus opens the same card hover does.
                  tabIndex={hittable ? 0 : -1}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive((cur) => (cur === i ? null : cur))}
                  role="button"
                  aria-label={`${person.name}, ${person.department}, ${person.country}`}
                >
                  <Image
                    src={person.photo}
                    alt=""
                    className={styles.avatarImg}
                    width={32}
                    height={32}
                    isEagerLoad
                  />

                  {/* The card. Always rendered so its fade-in and fade-out both
                      animate — mounting it on hover would make the entry jump,
                      and unmounting would cut the exit short. */}
                  <div
                    className={`${styles.hoverCard} ${isActive ? styles.hoverCardOpen : ""}`}
                  >
                    <p className={styles.cardName}>{person.name}</p>
                    <p className={styles.cardDept}>{person.department}</p>
                    <div className={styles.cardCountry}>
                      <img src={person.flag} alt="" className={styles.cardFlag} />
                      <span className={styles.cardCountryName}>{person.country}</span>
                    </div>
                    <span className={styles.hoverCardArrow} aria-hidden="true" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default wrapperHOC(Globe, {
  componentName: "Globe-CareerFinal",
  showForChina: true,
});
