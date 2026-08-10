import { useCallback, useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Globe.module.scss";
// Reuses AboutUsV2's postage-stamp frame and city photos — the country card here
// is the same cutout treatment as the hero title stamp there.
import stampFrame from "../../../AboutUsV2/assets/stamp-frame.svg";
import city1 from "../../../AboutUsV2/assets/city-1.jpg";
import city2 from "../../../AboutUsV2/assets/city-2.jpg";
import city3 from "../../../AboutUsV2/assets/city-3.jpg";
import city4 from "../../../AboutUsV2/assets/city-4.jpg";
import city5 from "../../../AboutUsV2/assets/city-5.jpg";
// Real photos for these two, supplied rather than borrowed from AboutUsV2.
import puneImg from "../../assets/city-pune.jpg";
import beijingImg from "../../assets/city-beijing.jpg";

interface Office {
  label: string;
  /** Real [latitude, longitude] — drives both the pin and the rotation target. */
  location: [number, number];
  photo: string;
  /** True while `photo` is a stand-in rather than this place's own landmark. */
  placeholder?: boolean;
}

// Two of these are countries rather than cities, so the coordinate is that
// country's principal city: Egypt → Cairo, Nigeria → Lagos. USA → New York.
//
// PHOTOS: Pune and Beijing have their own supplied shots; London (Tower Bridge)
// and USA (Statue of Liberty) borrow a correct landmark from AboutUsV2. Egypt,
// Nigeria and Dubai are still marked `placeholder` and show an unrelated
// landmark — drop a real photo in `../../assets/`, add the import and clear the
// flag to fix one; nothing else changes.
const OFFICES: Office[] = [
  { label: "Pune", location: [18.5204, 73.8567], photo: puneImg },
  { label: "London", location: [51.5072, -0.1276], photo: city2 },
  { label: "Beijing", location: [39.9042, 116.4074], photo: beijingImg },
  // Placeholder: Colosseum. Wants the Pyramids of Giza.
  { label: "Egypt", location: [30.0444, 31.2357], photo: city4, placeholder: true },
  // Placeholder: Sydney Opera House. Wants Zuma Rock / Lekki-Ikoyi bridge.
  { label: "Nigeria", location: [6.5244, 3.3792], photo: city5, placeholder: true },
  // Placeholder: Eiffel Tower. Wants the Burj Khalifa.
  { label: "Dubai", location: [25.2048, 55.2708], photo: city1, placeholder: true },
  { label: "USA", location: [40.7128, -74.006], photo: city3 },
];

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

// City-to-city travel time. Long enough to read as a journey across the surface
// rather than a jump, short enough not to feel like waiting.
const TRAVEL_MS = 900;

// Scroll-in zoom. The globe eases UP to its resting size rather than down from a
// larger one: COBE draws into a fixed-size canvas, so any scale that makes the
// sphere wider than the canvas is simply cropped by the drawing surface — no CSS
// overflow involved, and nothing can recover those pixels. At R = 0.4 the sphere
// spans 0.8 x canvas at scale 1, so 1.0 is the largest value that still fits.
const ZOOM_FROM = 0.72;
const ZOOM_TO = 1;
const ZOOM_MS = 1400;

/** Smooth in and out — no abrupt start or stop at either end. */
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Decelerating ease, for movements that start immediately and settle gently. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

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
/** Latitude → COBE `theta`. */
const thetaFor = (lat: number) => (lat * Math.PI) / 180;

/** Screen position of a pin, plus whether it is on the near face of the sphere. */
interface Projected {
  x: number;
  y: number;
  front: boolean;
}

/**
 * Project a lat/long to canvas pixels for the current rotation.
 *
 * COBE uses an orthographic camera, so this is a plain orthographic projection:
 * put the point on a unit sphere, apply the globe's yaw (phi) then pitch (theta),
 * and drop z. `front` is z > 0, i.e. the near hemisphere — far-side pins are
 * hidden rather than drawn through the globe.
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
  return { x: SIZE / 2 + xr * r, y: SIZE / 2 - yr * r, front: z2 > 0 };
};

/**
 * "A team creating tremendous value" — the offices globe (Figma 2859:17974).
 *
 * A COBE dot-sphere idles with a slow spin. Hovering a city pill OR its pin eases
 * the globe round so that city faces the viewer and raises a postage-stamp photo
 * card above the pin. The globe can also be grabbed and spun by hand.
 *
 * Pins are HTML rather than COBE markers so each one is individually hoverable.
 * They are positioned every frame by projecting their lat/long through the
 * current rotation.
 */
const Globe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  // True while the globe is still travelling to the selected city. The card waits
  // for arrival rather than being dragged across the surface with the pin.
  const [travelling, setTravelling] = useState(false);
  // Set when COBE could not start (no WebGL). The section then renders its copy and
  // pills without the sphere, rather than the error boundary eating all of it.
  const [globeFailed, setGlobeFailed] = useState(false);
  const [pins, setPins] = useState<Projected[]>(() =>
    OFFICES.map(() => ({ x: SIZE / 2, y: SIZE / 2, front: false })),
  );

  // Live rotation, in refs so the render loop mutates it without re-rendering.
  const phiRef = useRef(phiFor(60));
  const thetaRef = useRef(0.2);
  // Time-based tween toward a city. A fixed per-frame lerp (what this used to be)
  // decelerates forever without arriving, which reads as sluggish at the end;
  // snapshotting the start and easing over a set duration lands cleanly.
  const tweenRef = useRef<{
    fromPhi: number;
    fromTheta: number;
    toPhi: number;
    toTheta: number;
    start: number;
  } | null>(null);
  // Set while a city is selected, so the globe holds position instead of resuming
  // the idle spin the moment its tween finishes.
  const heldRef = useRef(false);
  // Zoom, animated on first scroll into view. COBE's own `scale` option.
  const scaleRef = useRef(ZOOM_FROM);
  const revealRef = useRef<{ start: number } | null>(null);
  // Drag state: pointer id, last position, and whether the slop was exceeded.
  const dragRef = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  // Pending "arrived" timer, so a fast change of city cancels the previous one.
  const arriveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const point = useCallback((i: number | null) => {
    setActive(i);
    if (i === null) {
      heldRef.current = false;
      tweenRef.current = null;
      setTravelling(false);
      if (arriveRef.current) clearTimeout(arriveRef.current);
      return;
    }
    const [lat, lon] = OFFICES[i].location;
    // Take the shorter way round so the globe never unwinds most of a turn.
    let toPhi = phiFor(lon);
    const from = phiRef.current;
    let d = toPhi - from;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    toPhi = from + d;

    heldRef.current = true;
    tweenRef.current = {
      fromPhi: from,
      fromTheta: thetaRef.current,
      toPhi,
      toTheta: thetaFor(lat),
      start: Date.now(),
    };

    // Only treat it as travel if there is a meaningful distance to cover —
    // re-hovering the city already centred should not blank its card.
    const far = Math.abs(d) > 0.06 || Math.abs(thetaFor(lat) - thetaRef.current) > 0.06;
    setTravelling(far);
    if (far) {
      if (arriveRef.current) clearTimeout(arriveRef.current);
      arriveRef.current = setTimeout(() => setTravelling(false), TRAVEL_MS * 0.62);
    }
  }, []);

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
      // Hand-spinning overrides any hover target, and clears the card so it does
      // not trail a city the user has spun away from.
      tweenRef.current = null;
      heldRef.current = false;
      setTravelling(false);
      setActive(null);
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

    // Pins need repositioning often enough to look attached, but a 60fps
    // setState would thrash React for no visible gain.
    let lastSync = 0;

    // COBE's `width`/`height` are NOT the CSS box — they become the resolution
    // uniform the shader sizes the sphere against, in DEVICE pixels. The actual
    // drawing buffer is sized by COBE's renderer (phenomenon) as
    // `clientWidth * devicePixelRatio`. So these two must be derived from the same
    // ratio: hardcoding `SIZE * 2` while passing the display's real ratio meant the
    // shader drew for a 1244px viewport into a 622px buffer on any 1x display —
    // the sphere came out at double scale, clipped to the canvas corner, with the
    // HTML pins (positioned in CSS px) no longer on it. Correct only at exactly 2x.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // COBE needs WebGL. Where it is missing or blocked — old browsers, a hardened
    // profile, software rendering disabled, GPU blocklists — createGlobe throws, and
    // an unhandled throw in here takes the whole section down with it: wrapperHOC's
    // error boundary catches it and renders nothing, so the heading, the lede and the
    // office pills all disappear along with the sphere. Catching it keeps every part
    // of the section that does not need a GPU.
    let globe: { destroy: () => void } | null = null;
    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: SIZE * dpr,
        height: SIZE * dpr,
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
          const tw = tweenRef.current;

          if (dragRef.current?.moved) {
            // Hand-driven: onPointerMove already set phi/theta this frame.
          } else if (tw) {
            // Eased travel to the selected city. Both axes share one clock, so the
            // globe arrives on latitude and longitude together rather than drifting
            // into place on one axis after the other.
            const p = Math.min(1, (now - tw.start) / TRAVEL_MS);
            const e = easeInOut(p);
            phiRef.current = tw.fromPhi + (tw.toPhi - tw.fromPhi) * e;
            thetaRef.current = tw.fromTheta + (tw.toTheta - tw.fromTheta) * e;
            if (p >= 1) tweenRef.current = null;
          } else if (heldRef.current) {
            // Arrived and still hovered — hold, so the card does not drift off its
            // pin while the user reads it.
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

          // Keep the resolution uniform pinned to the real drawing buffer. COBE reads
          // width/height off this state object every frame, and phenomenon rewrites
          // canvas.width/height on window resize (and the buffer changes outright if
          // the window moves to a display with a different pixel ratio). Without this
          // the pair silently desyncs again and the sphere goes back to being drawn at
          // the wrong scale.
          state.width = canvas.width;
          state.height = canvas.height;

          if (now - lastSync > 32) {
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
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[Globe] WebGL unavailable — rendering the section without it.", error);
      setGlobeFailed(true);
      return undefined;
    }

    return () => globe?.destroy();
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

  // Drop any pending arrival timer on unmount.
  useEffect(
    () => () => {
      if (arriveRef.current) clearTimeout(arriveRef.current);
    },
    [],
  );

  const current = active === null ? null : OFFICES[active];
  const currentPin = active === null ? null : pins[active];

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <Reveal className={styles.copy}>
          <h2 className={styles.title}>A team creating tremendous value</h2>
          <p className={styles.lede}>
            amber is built for the world, from India. 7 offices, 20 nationalities on the team, and a
            business that touches nearly every country on the map. It’s a rare vantage point, and a
            rare chance to build at global scale without any geographic constraints.
          </p>

          <p className={styles.operateFrom}>We operate from:</p>
          <ul className={styles.pills}>
            {OFFICES.map((office, i) => (
              <li key={office.label}>
                <button
                  type="button"
                  className={`${styles.pill} ${i === active ? styles.pillActive : ""}`}
                  onMouseEnter={() => point(i)}
                  onMouseLeave={() => point(null)}
                  onFocus={() => point(i)}
                  onBlur={() => point(null)}
                  aria-label={globeFailed ? office.label : `Show ${office.label} on the globe`}
                >
                  {office.label}
                </button>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Pointer handlers sit on the wrapper so a drag can start anywhere over
            the globe, including on a pin.

            Dropped entirely when COBE could not start: the pins are HTML overlays
            positioned from the sphere's rotation, so without it they would sit in a
            heap in an empty box. The copy and the office pills stay either way. */}
        {globeFailed ? null : (
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

          {/* HTML pins over the canvas, hidden on the far hemisphere.
              `pointer-events` stay OFF while a pin is selected: rotating the
              globe moves the pin out from under the cursor, which would fire
              mouseleave → globe returns → mouseenter, flickering forever. The
              pill/pin selection is latched instead, and released by leaving the
              globe area entirely (see onMouseLeave on the pin layer). */}
          <div
            className={styles.pinLayer}
            onMouseLeave={() => {
              if (!dragRef.current) point(null);
            }}
          >
            {OFFICES.map((office, i) => {
              const p = pins[i];
              const selected = i === active;
              return (
                <button
                  key={office.label}
                  type="button"
                  className={`${styles.pin} ${selected ? styles.pinActive : ""}`}
                  style={{
                    left: p.x,
                    top: p.y,
                    opacity: p.front ? 1 : 0,
                    // Off for the selected pin (see above) and for far-side pins.
                    pointerEvents: p.front && !selected && !dragging ? "auto" : "none",
                  }}
                  onMouseEnter={() => point(i)}
                  onFocus={() => point(i)}
                  onBlur={() => point(null)}
                  aria-label={`Show ${office.label} on the globe`}
                >
                  {/* Soft halo that ripples out across the dots around the pin
                      while it is selected. COBE draws the dots in its shader, so
                      individual dots cannot be animated — this reads as the
                      surface reacting without touching the globe render. */}
                  {selected ? <span className={styles.pinRipple} aria-hidden="true" /> : null}
                  <span className={styles.pinHead} aria-hidden="true" />
                  <span className={styles.pinDot} aria-hidden="true" />
                </button>
              );
            })}
          </div>

          {/* Postage-stamp card, anchored just above its pin. Held back until the
              globe has almost arrived, so it appears at its destination rather
              than being flown across the surface. */}
          {current && currentPin && !dragging && !travelling ? (
            <div
              className={styles.stamp}
              style={{ left: currentPin.x, top: currentPin.y }}
              aria-hidden="true"
            >
              <span key={current.label} className={styles.stampCard}>
                <Image
                  src={stampFrame}
                  alt=""
                  className={styles.stampFrame}
                  width={220}
                  height={216}
                  isEagerLoad
                />
                <span className={styles.stampWindow}>
                  <Image
                    src={current.photo}
                    alt=""
                    className={styles.stampPhoto}
                    width={220}
                    height={220}
                    isEagerLoad
                  />
                </span>
                <span className={styles.stampLabel}>{current.label}</span>
              </span>
            </div>
          ) : null}
        </div>
        )}
      </div>

      <span className={styles.preload} aria-hidden="true">
        {OFFICES.map((office) => (
          <Image key={office.label} src={office.photo} alt="" width={1} height={1} isEagerLoad />
        ))}
      </span>
    </section>
  );
};

export default wrapperHOC(Globe, {
  componentName: "Globe-CareerV2",
  showForChina: true,
});
