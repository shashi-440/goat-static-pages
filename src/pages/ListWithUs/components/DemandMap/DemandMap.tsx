import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import styles from "./DemandMap.module.scss";
import { ORIGINS, PARTNERS, PROPERTIES, ROUTES, TOTALS } from "./network";
import { isLand } from "./landMask";
import { buildArc, MAP_ASPECT, project, unproject } from "./mapProjection";
// Stands in where canvas is unavailable — the photo this map replaced, so the
// hero is never a blank box.
import fallbackPhoto from "../../assets/hero-bg.jpg";

/**
 * Hero — amber's global demand network.
 *
 * The reading order this is built to produce is WORLD → CONNECTIONS →
 * DESTINATIONS: a glance should say "people all over the world are looking for
 * these properties", before any label is read.
 *
 * Getting there meant inverting how the earlier version worked. That one drew
 * everything at full strength permanently — thirteen country flags, twelve city
 * labels with counts, and a column of eight partner wordmarks — which made a
 * geographic illustration with data parked on top of it. Nothing moved the eye
 * from origin to destination, and the partner column beside London was the
 * densest thing on the map while being the least spatial.
 *
 * Now the map holds still and the NETWORK is what changes:
 *
 *   · Origins are quiet dots until one is sending. Then, and only then, it lifts
 *     its country's flag and name — so a flag on screen always means "demand is
 *     leaving here right now" rather than "a country exists here".
 *   · Destinations are the heavy marks: bigger, ringed, and never dimmed as far
 *     as an origin. Four anchor labels stay up permanently so the map is legible
 *     frozen; the other eight surface as demand lands on them and fade back.
 *   · About four arcs are in the air at a time out of twenty-seven, each one
 *     travelling origin → destination and retracting into the city it lands on.
 *   · Partner logos are off the map entirely. They live in the hover card on a
 *     destination, which is where someone asking "who else lists here?" will
 *     look, and nowhere else.
 *
 * Reference frame is 1200px wide; every authored value is at that width and
 * scaled by `scale`, so the layout is identical at every breakpoint.
 *
 * Two canvases and an HTML layer: the land (drawn once per size change — it never
 * moves), the arcs (every frame), and HTML for nodes, labels and cards.
 */

/** Layout reference width. All authored pixel values are at this scale. */
const REF_W = 1200;

/** Spacing and radius of the land dots, at REF_W. */
const DOT_PITCH = 6;
const DOT_R = 1.7;

/**
 * Arc timing.
 *
 * 2800ms is slower than it needs to be to look smooth, on purpose: the arc is
 * carrying the sentence "this demand came from there and arrived here", and at
 * the 1800ms tried first the eye could not follow one line to its end before the
 * next launched.
 */
const ARC_MS = 2800;

/** Fraction of an arc's life spent flying; the rest is the tail catching up. */
const FLY = 0.72;

/** How long the destination pulses after an arrival, and holds its label up. */
const PULSE_MS = 900;
const LABEL_MS = 2000;

/** Arc colour ramp: blue leaving the origin, amber pink arriving at the city. */
const ARC_FROM: [number, number, number] = [28, 100, 242]; // #1c64f2, the hero CTA blue
const ARC_TO: [number, number, number] = [237, 58, 86]; // #ed3a56, $primary4

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/**
 * The launch queue.
 *
 * Arcs do NOT each run on their own period. That was the obvious design and it
 * measured badly: with a per-route period derived from the destination's weight,
 * the periods differ (5.5x to 9.1x the flight time) so the launches are only
 * evenly spread *within* each route, never across the set. Sampled over 14s the
 * coverage swung from 3,800 lit pixels down to 110 — a visibly empty map for a
 * couple of seconds, which is fatal for a graphic whose whole job is "demand keeps
 * arriving".
 *
 * Instead there is one global cadence: a launch every LAUNCH_GAP, cycling through
 * a fixed queue of slots. Because a flight lasts ARC_MS and a launch happens every
 * ARC_MS / TARGET_IN_FLIGHT, there are always almost exactly TARGET_IN_FLIGHT arcs
 * up — no bunching and no lulls, by construction rather than by tuning.
 *
 * Weighting survives: a busy destination earns extra slots in the queue rather
 * than a shorter period, so London still appears about three times as often as
 * Berlin. Repeats are laid out in ROUNDS — every route once, then the busiest
 * again, then the busiest again.
 *
 * The queue is then re-ordered by a STRIDE, which matters more than it sounds.
 * `ROUTES` is grouped by origin, so launching in queue order walked the origin list
 * from India to Brazil in sequence: demand appeared to sweep across the world on a
 * fixed circuit, which read as mechanical. Stepping through the queue by a stride
 * co-prime with its length scatters origins and destinations while staying
 * completely deterministic — no randomness, so SSR and client agree and the
 * sequence is reproducible.
 *
 * Stride 2 was chosen by measuring every co-prime candidate: it is the one that
 * maximises the gap between two slots of the SAME route (5 slots, comfortably more
 * than the ~4 in flight, so no route ever overlaps itself) while mixing origins.
 * It opens India→London, India→Birmingham, India→Amsterdam, China→Sydney,
 * Nigeria→Coventry, Kenya→Manchester, Egypt→Barcelona.
 */
const TARGET_IN_FLIGHT = 4;
const LAUNCH_GAP = Math.round(ARC_MS / TARGET_IN_FLIGHT);

/** Queue slots a destination earns, by weight. */
const slotsFor = (weight: number) => (weight >= 5 ? 3 : weight >= 4 ? 2 : 1);

interface Slot {
  /** Index into `ROUTES`. */
  route: number;
  /** Milliseconds into the cycle at which this slot launches. */
  at: number;
}

/** Must stay co-prime with the queue length; see the note above. */
const QUEUE_STRIDE = 2;

const SLOTS: Slot[] = (() => {
  const rounds: number[] = [];
  for (let round = 1; round <= 3; round += 1) {
    ROUTES.forEach((route, i) => {
      if (slotsFor(PROPERTIES[route.to].weight) >= round) rounds.push(i);
    });
  }
  const n = rounds.length;
  return rounds.map((_, k) => ({
    route: rounds[(k * QUEUE_STRIDE) % n],
    at: k * LAUNCH_GAP,
  }));
})();

const CYCLE_MS = SLOTS.length * LAUNCH_GAP;

/**
 * The four highest-volume destinations, whose labels never leave — so the map is
 * legible even frozen. They happen to spread across the UK, the US and Australia,
 * so the permanently readable part of the map is already global.
 */
const TOP_LABELS = new Set(
  PROPERTIES.map((c, i) => ({ i, e: c.enquiries }))
    .sort((a, b) => b.e - a.e)
    .slice(0, 4)
    .map((x) => x.i),
);

/** On-screen diameter of a destination node, before `scale`. */
const nodeSize = (weight: number) => 9 + weight * 1.6;

/** Which partners list in each city, for the destination hover card. */
const PARTNERS_BY_CITY = PROPERTIES.map((_, i) => PARTNERS.filter((p) => p.city === i));

/** Which routes leave each origin, so an origin can be lit by any of them. */
const ROUTES_BY_ORIGIN = ORIGINS.map((_, i) => ROUTES.filter((r) => r.from === i));

interface Phase {
  active: boolean;
  head: number;
  tail: number;
  landed: number;
}

/** What every arc looks like under `prefers-reduced-motion`: drawn, not moving. */
const STILL_PHASE: Phase = { active: true, head: 1, tail: 0, landed: 0 };

const phaseFor = (slot: Slot, elapsed: number): Phase => {
  const p = (((elapsed - slot.at) % CYCLE_MS) + CYCLE_MS) % CYCLE_MS / ARC_MS;
  if (p > 1) return { active: false, head: 0, tail: 0, landed: 0 };

  return {
    active: true,
    head: easeOut(clamp01(p / FLY)),
    tail: easeInOut(clamp01((p - (1 - FLY)) / FLY)),
    landed: clamp01(((p - FLY) * ARC_MS) / PULSE_MS),
  };
};

/**
 * How lit an origin is while it is sending: up fast as the arc leaves, held for
 * most of the flight, down as the arc arrives. The flag marks demand LEAVING, so
 * it should be gone by the time that demand has landed somewhere else.
 */
const originGlow = (head: number) =>
  Math.min(1, head / 0.06) * (head < 0.82 ? 1 : Math.max(0, (1 - head) / 0.18));

/** Live per-node state, recomputed in the render loop and pushed to React. */
interface NodeState {
  /** Arrival pulse, 1 at the moment of landing → 0. */
  pulse: number;
  /** Label prominence, 1 at landing → 0 over LABEL_MS. */
  label: number;
}

const DemandMap = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<HTMLCanvasElement>(null);
  const landRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef(0);
  const rafRef = useRef(0);
  const hoveredRef = useRef<number | null>(null);
  /** When each city last received an arc, for the label hold. */
  const arrivedRef = useRef<number[]>(PROPERTIES.map(() => 0));

  const [width, setWidth] = useState(REF_W);
  const [hovered, setHovered] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [nodes, setNodes] = useState<NodeState[]>(() =>
    PROPERTIES.map(() => ({ pulse: 0, label: 0 })),
  );
  const [glow, setGlow] = useState<number[]>(() => ORIGINS.map(() => 0));

  const height = Math.round(width / MAP_ASPECT);
  const scale = width / REF_W;

  // Projected geometry. Recomputed only on resize — this is the whole layout.
  const cities = useMemo(
    () => PROPERTIES.map((c) => project(c.location[1], c.location[0], width, height)),
    [width, height],
  );
  const origins = useMemo(
    () => ORIGINS.map((o) => project(o.location[1], o.location[0], width, height)),
    [width, height],
  );
  const arcs = useMemo(
    () => ROUTES.map((r) => buildArc(origins[r.from], cities[r.to])),
    [origins, cities],
  );

  /**
   * Destinations whose node is buried under a bigger neighbour's.
   *
   * London, Manchester, Birmingham and Coventry land within 11px of each other at
   * the reference width, and a node is up to 17px across — so the top three
   * physically cover Birmingham and Coventry and there is no cursor position that
   * reaches them. (Playwright says so in as many words: "Manchester's node
   * intercepts pointer events", then times out.)
   *
   * Rather than shrink the nodes or move the cities, an occluded city gets a
   * PERMANENT label and its label becomes the hit target — which is how a paper map
   * has always handled a dense cluster, and why the fanned Atlantic column exists
   * in the first place. Computed from the live geometry, so it adapts to the width
   * instead of hard-coding which cities are unlucky.
   */
  const occluded = useMemo(() => {
    const out = PROPERTIES.map(() => false);
    PROPERTIES.forEach((city, i) => {
      const ri = (nodeSize(city.weight) * Math.max(0.7, scale)) / 2;
      out[i] = PROPERTIES.some((other, j) => {
        if (j === i) return false;
        // Only a node that stacks ABOVE this one can bury it; z-index is weight,
        // ties broken by index, matching the render order.
        const above = other.weight > city.weight || (other.weight === city.weight && j < i);
        if (!above) return false;
        const rj = (nodeSize(other.weight) * Math.max(0.7, scale)) / 2;
        return Math.hypot(cities[j].x - cities[i].x, cities[j].y - cities[i].y) < (ri + rj) * 0.9;
      });
    });
    return out;
  }, [cities, scale]);

  /** Labels that stay up: the four biggest, plus every unreachable node. */
  const alwaysLabelled = useMemo(
    () => PROPERTIES.map((_, i) => TOP_LABELS.has(i) || occluded[i]),
    [occluded],
  );

  const enter = useCallback((i: number) => {
    hoveredRef.current = i;
    setHovered(i);
  }, []);
  const leave = useCallback(() => {
    hoveredRef.current = null;
    setHovered(null);
  }, []);

  // ---- Responsive: one measured width drives everything -------------------
  useEffect(() => {
    const box = boxRef.current;
    if (!box || typeof ResizeObserver === "undefined") return undefined;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const measure = () => {
      const next = Math.round(box.clientWidth);
      setWidth((prev) => (Math.abs(prev - next) > 4 ? next : prev));
    };
    measure();
    const ro = new ResizeObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(measure, 150);
    });
    ro.observe(box);
    return () => {
      ro.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  // ---- The land: drawn once per size, never per frame ---------------------
  useEffect(() => {
    const cv = landRef.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(width * dpr);
    cv.height = Math.round(height * dpr);
    const ctx = cv.getContext("2d");
    if (!ctx) {
      setFailed(true);
      return;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    // Tuned twice. #9ca3af competed with the nodes; #c9ced7 went too far the other
    // way and the continents nearly vanished, which costs the map its "world".
    // #b4bbc6 keeps the coastlines readable while staying clearly behind the
    // network drawn on top of it.
    ctx.fillStyle = "#b4bbc6";

    const pitch = DOT_PITCH * scale;
    const r = Math.max(1, DOT_R * scale);
    const ox = (width % pitch || pitch) / 2;
    const oy = (height % pitch || pitch) / 2;
    for (let y = oy; y < height; y += pitch) {
      for (let x = ox; x < width; x += pitch) {
        const { lon, lat } = unproject(x, y, width, height);
        if (!isLand(lon, lat)) continue;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [width, height, scale]);

  // ---- The connections ----------------------------------------------------
  useEffect(() => {
    const canvas = arcRef.current;
    if (!canvas) return undefined;

    const still =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setFailed(true);
      return undefined;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!startRef.current) startRef.current = Date.now();

    // Node and origin state go through React (they drive DOM transforms and
    // opacity), so they are throttled well below frame rate.
    let lastSync = 0;

    const frame = () => {
      const now = Date.now();
      const elapsed = now - startRef.current;
      const focus = hoveredRef.current;

      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";

      const pulses = PROPERTIES.map(() => 0);
      const glows = ORIGINS.map(() => 0);

      // Reduced motion draws every route once, whole and still — the network is
      // fully legible, nothing animates. Otherwise the launch queue decides.
      const drawing = still
        ? ROUTES.map((_, i) => ({ i, phase: STILL_PHASE }))
        : SLOTS.map((slot) => ({ i: slot.route, phase: phaseFor(slot, elapsed) }));

      for (const item of drawing) {
        const i = item.i;
        const { active, head, tail, landed } = item.phase;
        if (!active) continue;

        const route = ROUTES[i];
        glows[route.from] = Math.max(glows[route.from], still ? 1 : originGlow(head));

        if (!still && landed > 0) {
          pulses[route.to] = Math.max(pulses[route.to], 1 - landed);
          // Stamp the arrival inside the first slice of the pulse window, which
          // at 60fps is always sampled. Drives the label hold, which outlasts the
          // pulse and so cannot be derived from the phase alone.
          if (landed < 0.15) arrivedRef.current[route.to] = now;
        }

        // Everything not feeding the hovered city drops right back, so one city's
        // inbound traffic can be read on its own.
        const dim = focus !== null && route.to !== focus;
        const base = dim ? 0.07 : 1;

        const pts = arcs[i];
        const last = pts.length - 1;
        const headIdx = head * last;
        const tailIdx = tail * last;
        const span = Math.max(1e-3, head - tail);
        ctx.lineWidth = (dim ? 1 : 2.4) * Math.max(0.75, scale);

        for (let j = Math.floor(tailIdx) + 1; j <= Math.ceil(headIdx); j += 1) {
          const a = pts[j - 1];
          const bpt = pts[j];
          if (!a || !bpt) continue;

          // Clip the end segments to the exact head/tail, or the arc grows and
          // retracts in visible whole-sample steps.
          let ax = a.x;
          let ay = a.y;
          let bx = bpt.x;
          let by = bpt.y;
          let at = (j - 1) / last;
          let bt = j / last;
          if (tailIdx > j - 1) {
            const f = tailIdx - (j - 1);
            ax += (bpt.x - a.x) * f;
            ay += (bpt.y - a.y) * f;
            at += (bt - at) * f;
          }
          if (headIdx < j) {
            const f = headIdx - (j - 1);
            bx = a.x + (bpt.x - a.x) * f;
            by = a.y + (bpt.y - a.y) * f;
            bt = (j - 1) / last + (bt - (j - 1) / last) * f;
          }
          if (bt <= at) continue;

          // Brighter toward the head so the line reads as travelling even in a
          // frozen frame, and warmer toward the end so arriving is visibly
          // different from leaving.
          const nearHead = clamp01((bt - tail) / span);
          const mid = (at + bt) / 2;
          const cr = Math.round(ARC_FROM[0] + (ARC_TO[0] - ARC_FROM[0]) * mid);
          const cg = Math.round(ARC_FROM[1] + (ARC_TO[1] - ARC_FROM[1]) * mid);
          const cb = Math.round(ARC_FROM[2] + (ARC_TO[2] - ARC_FROM[2]) * mid);
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},${base * (0.32 + 0.68 * nearHead)})`;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }

        // The travelling head. Grows as it approaches so the arrival has weight —
        // the line has to visibly END at the property, not just stop.
        if (!dim && head > 0 && head < 1) {
          const fj = head * last;
          const j0 = Math.floor(fj);
          const a = pts[j0];
          const bpt = pts[Math.min(last, j0 + 1)];
          const f = fj - j0;
          const hx = a.x + (bpt.x - a.x) * f;
          const hy = a.y + (bpt.y - a.y) * f;
          const cr = Math.round(ARC_FROM[0] + (ARC_TO[0] - ARC_FROM[0]) * head);
          const cg = Math.round(ARC_FROM[1] + (ARC_TO[1] - ARC_FROM[1]) * head);
          const cb = Math.round(ARC_FROM[2] + (ARC_TO[2] - ARC_FROM[2]) * head);
          ctx.fillStyle = `rgba(${cr},${cg},${cb},0.95)`;
          ctx.beginPath();
          ctx.arc(hx, hy, (2.2 + 1.6 * head) * Math.max(0.8, scale), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (now - lastSync > 80) {
        lastSync = now;
        const next = PROPERTIES.map((_, i) => ({
          pulse: pulses[i],
          label: clamp01(1 - (now - arrivedRef.current[i]) / LABEL_MS),
        }));
        setNodes((prev) =>
          prev.some(
            (v, i) =>
              Math.abs(v.pulse - next[i].pulse) > 0.02 || Math.abs(v.label - next[i].label) > 0.02,
          )
            ? next
            : prev,
        );
        setGlow((prev) => (prev.some((v, i) => Math.abs(v - glows[i]) > 0.02) ? glows : prev));
      }

      if (!still) rafRef.current = window.requestAnimationFrame(frame);
    };

    frame();
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [arcs, width, height, scale]);

  const fmt = (n: number) => n.toLocaleString("en-GB");

  if (failed) {
    return (
      <div ref={boxRef} className={styles.box}>
        <Image
          src={fallbackPhoto}
          alt="A property team working together around a table"
          className={styles.fallback}
          width="100%"
          height="100%"
          isEagerLoad
        />
      </div>
    );
  }

  return (
    <div ref={boxRef} className={styles.box}>
      <p className={styles.stats}>
        <span className={styles.statBig}>{fmt(TOTALS.enquiries)}</span>
        <span className={styles.statLabel}>student enquiries in the last 7 days</span>
        <span className={styles.statRule} aria-hidden="true" />
        <span className={styles.statMinor}>
          from <b>{TOTALS.countries} countries</b> into <b>{TOTALS.cities} cities</b>
        </span>
      </p>

      <div
        className={styles.map}
        style={{ height }}
        onMouseLeave={leave}
        role="img"
        aria-label={`World map showing ${TOTALS.enquiries} student enquiries arriving into ${TOTALS.cities} amber cities from ${TOTALS.countries} countries`}
      >
        <canvas
          ref={landRef}
          className={styles.landCanvas}
          style={{ width, height }}
          aria-hidden="true"
        />
        <canvas
          ref={arcRef}
          className={styles.arcCanvas}
          style={{ width, height }}
          aria-hidden="true"
        />

        {/* ORIGINS — quiet dots that identify themselves only while sending.
            A flag on screen therefore always means "demand is leaving here right
            now", which is what stops thirteen permanent flags from reading as
            decoration. */}
        {ORIGINS.map((origin, i) => {
          const p = origins[i];
          const g = glow[i];
          const lit = g > 0.05;
          const muted = hovered !== null && !ROUTES_BY_ORIGIN[i].some((r) => r.to === hovered);
          return (
            <div
              key={origin.label}
              className={styles.origin}
              style={{ opacity: muted ? 0.25 : 1 }}
              aria-hidden="true"
            >
              <span
                className={styles.originDot}
                style={{
                  left: p.x,
                  top: p.y,
                  // Always present so the world reads as populated — at the 0.4
                  // floor tried first they barely registered against the land and
                  // the "demand comes from everywhere" half of the story was lost.
                  // Brightens and grows only while actually sending.
                  opacity: 0.62 + 0.38 * g,
                  transform: `translate(-50%, -50%) scale(${1 + 0.5 * g})`,
                }}
              />
              {lit ? (
                <span className={styles.originTag} style={{ left: p.x, top: p.y, opacity: g }}>
                  <img src={origin.flag} alt="" className={styles.originFlag} />
                  {origin.label}
                </span>
              ) : null}
            </div>
          );
        })}

        {/* DESTINATIONS — the heavy end of the story. */}
        {PROPERTIES.map((city, i) => {
          const p = cities[i];
          const { dx, dy, align } = city.label_at;
          const on = hovered === i;
          const { pulse, label } = nodes[i];
          // Permanent for the four biggest and for any buried node; the rest ride
          // in on an arrival or a hover and fade back out.
          const pinned = alwaysLabelled[i];
          const labelShown = pinned || on || label > 0.02;
          const labelOpacity = pinned || on ? 1 : label;
          const size = nodeSize(city.weight) * Math.max(0.7, scale);
          return (
            <div
              key={city.label}
              className={`${styles.city} ${on ? styles.cityOn : ""}`}
              style={{
                // Never dimmed as far as an origin — destinations stay the
                // dominant mark even when another city has focus.
                opacity: hovered === null || on ? 1 : 0.5,
                zIndex: on ? 40 : 10 + city.weight,
              }}
            >
              {labelShown && Math.hypot(dx, dy) * scale > 26 ? (
                <svg className={styles.leader} aria-hidden="true">
                  <line
                    x1={p.x}
                    y1={p.y}
                    x2={p.x + dx * scale + (align === "right" ? 4 : -4)}
                    y2={p.y + dy * scale}
                    stroke="#b9c0ca"
                    strokeWidth="1"
                    opacity={labelOpacity}
                  />
                </svg>
              ) : null}

              <button
                type="button"
                className={styles.node}
                style={{ left: p.x, top: p.y, width: size, height: size }}
                onMouseEnter={() => enter(i)}
                onFocus={() => enter(i)}
                onBlur={leave}
                aria-label={`${city.label}, ${city.country} — ${city.enquiries} enquiries${
                  PARTNERS_BY_CITY[i].length
                    ? `, partners: ${PARTNERS_BY_CITY[i].map((x) => x.name).join(", ")}`
                    : ""
                }`}
              >
                {/* Two rings: a static halo that gives every destination more
                    presence than an origin, and the arrival ring driven by JS. */}
                <span className={styles.halo} aria-hidden="true" />
                <span
                  className={styles.ring}
                  style={{
                    opacity: pulse * 0.55,
                    transform: `translate(-50%, -50%) scale(${1 + (1 - pulse) * 2.6})`,
                  }}
                  aria-hidden="true"
                />
              </button>

              {labelShown ? (
                <span
                  className={`${styles.label} ${align === "right" ? styles.labelRight : ""} ${
                    pinned ? styles.labelHit : ""
                  }`}
                  style={{
                    left: p.x + dx * scale,
                    top: p.y + dy * scale,
                    opacity: labelOpacity,
                  }}
                  // Permanent labels are hoverable, which is the ONLY way to reach
                  // a city whose node is buried in the UK cluster. Transient ones
                  // are not: a label fading out under the cursor would latch the
                  // hover it is fading because of. The node stays the keyboard
                  // target either way, since focus does not need hit-testing.
                  onMouseEnter={pinned ? () => enter(i) : undefined}
                  aria-hidden="true"
                >
                  <b className={styles.labelName}>{city.label}</b>
                  <span className={styles.labelCount}>{city.enquiries}</span>
                </span>
              ) : null}

              {/* Hover card. The only place partner logos appear now: someone
                  asking "who else lists here?" is asking it about a city, so the
                  answer belongs on the city, not stacked beside it. */}
              {on ? (
                <span
                  className={`${styles.card} ${align === "right" ? styles.cardRight : ""}`}
                  style={{ left: p.x, top: p.y }}
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
                  {PARTNERS_BY_CITY[i].length ? (
                    <span className={styles.cardPartners}>
                      {PARTNERS_BY_CITY[i].map((partner) => (
                        <img
                          key={partner.name}
                          src={partner.logo}
                          alt=""
                          className={styles.cardLogo}
                        />
                      ))}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Everything the map shows, as text — for screen readers, for crawlers, and
          for anyone with canvas disabled. */}
      <p className={styles.srOnly}>
        amber lists student accommodation in{" "}
        {PROPERTIES.map((c) => `${c.label} (${c.enquiries} enquiries)`).join(", ")}. Demand arrives
        from {ORIGINS.map((o) => o.label).join(", ")} and beyond. Property partners listing on amber
        include {PARTNERS.map((p) => p.name).join(", ")}. Figures are illustrative.
      </p>
    </div>
  );
};

export default wrapperHOC(DemandMap, {
  componentName: "DemandMap-ListWithUs",
  showForChina: true,
});
