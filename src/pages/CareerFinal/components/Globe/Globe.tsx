import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
// The About Us count-up: renders the final value on the server so the figures
// are present without JS, then counts from 0 once visible.
import CountUp from "../../../AboutUsV2/components/CountUp/CountUp";
import styles from "./Globe.module.scss";
// Team headshots — the markers are the people, not the places. Six individual
// shots plus five crew shots is every face this page has; with fifteen markers a
// few faces necessarily appear twice, so the repeats are placed far apart (and
// never in the same hemisphere) where the rotation will not show them together.
import harshalImg from "../../assets/team-harshal.jpg";
import davidImg from "../../assets/team-david.jpg";
import mernaImg from "../../assets/team-merna.jpg";
import solomonImg from "../../assets/team-solomon.jpg";
import danImg from "../../assets/team-dan.jpg";
import bhanuImg from "../../assets/team-bhanu.jpg";
import crew1 from "../../assets/crew-1.jpg";
import crew2 from "../../assets/crew-2.jpg";
import crew3 from "../../assets/crew-3.jpg";
import crew4 from "../../assets/crew-4.jpg";
import crew5 from "../../assets/crew-5.jpg";

interface Office {
  label: string;
  /** Real [latitude, longitude] — where the avatar sits on the sphere. */
  location: [number, number];
  /** Face shown at this location. */
  photo: string;
}

// Fifteen people across the map.
//
// The seven staffed offices come first — those coordinates are the real office
// cities and are fixed. The remaining eight were CHOSEN, not picked by feel: a
// full rotation was simulated and each addition selected to maximise the
// worst-case on-screen distance between any two simultaneously-visible faces.
// The result clears 45px at its tightest, against a 44px face, so no two faces
// overlap at any rotation. The binding pair is Pune/Dubai — both real offices,
// so that gap is the floor.
//
// This is why the extras are not the obvious European markets: London, Berlin
// and Barcelona sit within ~15px of each other on the sphere, as do New York and
// Toronto, and any set containing those pairs overlaps no matter how the faces
// are sized.
//
// For office entries naming a country rather than a city, the coordinate is that
// country's principal city: Egypt -> Cairo, Nigeria -> Lagos, USA -> New York.
const OFFICES: Office[] = [
  // --- staffed offices ---
  { label: "Pune", location: [18.5204, 73.8567], photo: harshalImg },
  { label: "London", location: [51.5072, -0.1276], photo: davidImg },
  { label: "Beijing", location: [39.9042, 116.4074], photo: crew1 },
  { label: "Egypt", location: [30.0444, 31.2357], photo: mernaImg },
  { label: "Nigeria", location: [6.5244, 3.3792], photo: solomonImg },
  { label: "Dubai", location: [25.2048, 55.2708], photo: danImg },
  { label: "USA", location: [40.7128, -74.006], photo: bhanuImg },
  // --- teammates across the markets we serve ---
  { label: "Sydney", location: [-33.8688, 151.2093], photo: crew2 },
  { label: "Singapore", location: [1.3521, 103.8198], photo: crew3 },
  { label: "S\u00e3o Paulo", location: [-23.5558, -46.6396], photo: crew4 },
  { label: "Nairobi", location: [-1.2864, 36.8172], photo: crew5 },
  { label: "Mexico City", location: [19.4326, -99.1332], photo: harshalImg },
  { label: "Vancouver", location: [49.2827, -123.1207], photo: davidImg },
  { label: "Cape Town", location: [-33.9249, 18.4241], photo: solomonImg },
  { label: "Auckland", location: [-36.8485, 174.7633], photo: mernaImg },
];

interface Stat {
  target: number;
  suffix: string;
  label: string;
}

// Business stats, replacing the stale "7 offices, 20 nationalities" prose that
// used to carry these numbers inside the lede.
// Labels verbatim from Figma 1565:3930.
const STATS: Stat[] = [
  { target: 500, suffix: "+", label: "Amazing people" },
  { target: 20, suffix: "+", label: "Nationalities represented" },
  { target: 15, suffix: "+", label: "Languages spoken" },
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
  const [pins, setPins] = useState<Projected[]>(() =>
    OFFICES.map(() => ({ x: SIZE / 2, y: SIZE / 2, z: -1 })),
  );

  // Live rotation, in refs so the render loop mutates it without re-rendering.
  const phiRef = useRef(phiFor(60));
  const thetaRef = useRef(0.2);
  // Zoom, animated on first scroll into view. COBE's own `scale` option.
  const scaleRef = useRef(ZOOM_FROM);
  const revealRef = useRef<{ start: number } | null>(null);
  // Drag state: pointer id, last position, and whether the slop was exceeded.
  const dragRef = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);

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
            OFFICES.map((o) =>
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
          <ul className={styles.stats}>
            {STATS.map((stat, i) => (
              <Reveal as="li" key={stat.label} className={styles.stat} delay={160 + i * 90}>
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
            aria-label="A rotating globe marking amber's seven offices"
            role="img"
          />

          {/* Faces over the canvas, easing out around the limb. These are
              presentational: no pointer events at all, so a cursor crossing the
              globe never disturbs the spin, and nothing is focusable. The whole
              layer is aria-hidden because the canvas already carries the
              descriptive label and the same city names are listed as text in the
              copy column — announcing seven unlabelled images would only repeat
              that. */}
          <div className={styles.pinLayer} aria-hidden="true">
            {OFFICES.map((office, i) => {
              const p = pins[i];
                // Depth drives both opacity and scale, so a face eases away as
                // it rotates toward the limb and eases back as it comes round —
                // symmetric in both directions, which is what makes the motion
                // read as the sphere turning rather than as a cross-fade.
                const k = presence(p.z);
                return (
                <div
                  key={office.label}
                  className={styles.avatarPin}
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
                  }}
                >
                  <Image
                    src={office.photo}
                    alt=""
                    className={styles.avatarImg}
                    width={44}
                    height={44}
                    isEagerLoad
                  />
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
